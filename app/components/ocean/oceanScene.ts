/**
 * 「Bioluminescent Ocean × Neural Current」
 *
 * three.js の WebGPURenderer で描く深海シーン。
 *  - 背景: 深度グラデーション + 斜めの光のシャフト + コースティクスの霞
 *  - 海面: 波で変位する巨大プレーンを水中から見上げた光の揺らぎ
 *  - 発光粒子: GPU compute（WebGPU=WGSL / WebGL2=transform feedback）で流れ場を積分
 *  - ニューラル格子: AI 側のモチーフとして脈打つワイヤーフレーム
 *  - Bloom によるグロー
 *
 * WebGPU が無い環境では three.js が WebGL2 バックエンドへ自動的に落ちる。
 * どちらでも同じ compute シェーダが動く（WebGL2 側は transform feedback で代替）。
 */

import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  cross,
  deltaTime,
  exp,
  float,
  hash,
  instanceIndex,
  instancedArray,
  length,
  max,
  min,
  mix,
  mx_fractal_noise_vec3,
  mx_noise_float,
  normalize,
  oneMinus,
  pass,
  positionLocal,
  positionView,
  pow,
  saturate,
  screenUV,
  smoothstep,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

export interface OceanSceneHandle {
  dispose(): void;
  /** 実際に使われたバックエンド名（診断用） */
  backend: "webgpu" | "webgl2";
  particleCount: number;
}

export interface OceanSceneOptions {
  canvas: HTMLCanvasElement;
  /** prefers-reduced-motion: 1フレームだけ描いて静止させる */
  reducedMotion?: boolean;
  /** 検証用に WebGL2 バックエンドを強制する */
  forceWebGL?: boolean;
}

/** 粒子が漂う空間の半径（ワールド単位） */
const BOX_X = 54;
const BOX_Y = 30;
const BOX_Z = 26;

const SURFACE_Y = 26;
const CAMERA_Z = 44;

type Tier = {
  particles: number;
  dpr: number;
  bloom: boolean;
  surfaceSegments: number;
  lattice: boolean;
};

function pickTier(hasWebGPU: boolean, viewportWidth: number): Tier {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const isSmall = viewportWidth < 768;
  const cores =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;

  if (isSmall) {
    return {
      particles: 20000,
      dpr: Math.min(dpr, 1.5),
      bloom: false,
      surfaceSegments: 80,
      lattice: false,
    };
  }

  if (hasWebGPU && cores >= 8) {
    return {
      particles: 90000,
      dpr: Math.min(dpr, 1.75),
      bloom: true,
      surfaceSegments: 200,
      lattice: true,
    };
  }

  if (hasWebGPU) {
    return {
      particles: 55000,
      dpr: Math.min(dpr, 1.6),
      bloom: true,
      surfaceSegments: 150,
      lattice: true,
    };
  }

  // WebGL2 フォールバック
  return {
    particles: 32000,
    dpr: Math.min(dpr, 1.5),
    bloom: true,
    surfaceSegments: 120,
    lattice: true,
  };
}

export async function createOceanScene({
  canvas,
  reducedMotion = false,
  forceWebGL = false,
}: OceanSceneOptions): Promise<OceanSceneHandle> {
  const hasWebGPU =
    !forceWebGL && typeof navigator !== "undefined" && "gpu" in navigator;

  // タブが非表示のまま初期化されると clientWidth が 0 になり得るので、
  // 必ず妥当な値へ丸めてから品質ティアを決める
  const measure = () => {
    const w =
      canvas.clientWidth ||
      canvas.parentElement?.clientWidth ||
      window.innerWidth ||
      1280;
    const h =
      canvas.clientHeight ||
      canvas.parentElement?.clientHeight ||
      window.innerHeight ||
      720;
    return { w, h };
  };

  const initialSize = measure();
  const tier = pickTier(hasWebGPU, initialSize.w);
  const count = tier.particles;

  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: false,
    alpha: false,
    forceWebGL: !hasWebGPU,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(tier.dpr);
  renderer.setSize(initialSize.w, initialSize.h, false);
  renderer.setClearColor(0x02060f, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  await renderer.init();

  const backend: OceanSceneHandle["backend"] =
    (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true
      ? "webgpu"
      : "webgl2";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    initialSize.w / initialSize.h,
    0.1,
    600
  );
  camera.position.set(0, 0, CAMERA_Z);
  camera.lookAt(0, 6, 0);

  // ── uniforms ───────────────────────────────────────────────────────────────
  const uPointer = uniform(new THREE.Vector3(0, 0, 8));
  const uPointerStrength = uniform(0);
  const uIntensity = uniform(1);
  const uSpeed = uniform(reducedMotion ? 0 : 1);
  const uParticleScale = uniform(1);

  // ── 背景: 深度グラデ + 光のシャフト ───────────────────────────────────────
  scene.backgroundNode = Fn(() => {
    const p = screenUV;
    const depth = saturate(p.y);

    const abyss = vec3(0.0015, 0.006, 0.018);
    const deep = vec3(0.004, 0.026, 0.052);
    const shallow = vec3(0.016, 0.086, 0.132);

    const base = mix(abyss, deep, pow(depth, float(1.7)));
    const litted = mix(
      base,
      shallow,
      pow(saturate(depth.sub(0.46).mul(1.85)), float(2.0)).mul(0.85)
    );

    // 右側にインディゴ（AI 側）を差す
    const indigo = vec3(0.040, 0.030, 0.125);
    const tinted = litted.add(indigo.mul(smoothstep(0.38, 1.0, p.x).mul(0.8)));

    // 斜めに差し込む光のシャフト
    const t = time.mul(0.045);
    const sx = p.x.add(oneMinus(p.y).mul(0.55));
    const s1 = mx_noise_float(vec3(sx.mul(7.0), t, 0.0)).mul(0.5).add(0.5);
    const s2 = mx_noise_float(vec3(sx.mul(15.0), t.mul(1.6).add(11.0), 0.0))
      .mul(0.5)
      .add(0.5);
    const shafts = pow(s1.mul(0.7).add(s2.mul(0.3)), float(4.2));
    const shaftFade = smoothstep(0.0, 0.9, depth).mul(
      smoothstep(1.1, 0.1, length(p.sub(vec2(0.44, 1.0))))
    );
    const withShafts = tinted.add(
      vec3(0.20, 0.50, 0.62).mul(shafts).mul(shaftFade)
    );

    // コースティクスの霞
    const haze = mx_noise_float(
      vec3(p.x.mul(3.2), p.y.mul(2.1).sub(time.mul(0.025)), time.mul(0.04))
    )
      .mul(0.5)
      .add(0.5);
    const withHaze = withShafts.add(
      vec3(0.010, 0.042, 0.060).mul(pow(haze, float(3.5)))
    );

    // ビネット
    const vignette = saturate(
      oneMinus(pow(length(p.sub(vec2(0.5, 0.5))).mul(1.28), float(2.0)))
    );
    const finalColor = withHaze.mul(mix(float(0.30), float(1.0), vignette));

    return vec4(finalColor, 1.0);
  })();

  // ── 粒子: GPU compute ─────────────────────────────────────────────────────
  const positions = instancedArray(count, "vec3");
  const velocities = instancedArray(count, "vec3");
  const seeds = instancedArray(count, "vec4");
  // WebGL2 バックエンドでは頂点/compute からの読み出しを PBO 経由にする
  positions.setPBO(true);
  velocities.setPBO(true);
  seeds.setPBO(true);

  const rnd = (salt: number) => hash(instanceIndex.add(salt));

  const initCompute = Fn(() => {
    const pos = positions.element(instanceIndex);
    const vel = velocities.element(instanceIndex);
    const seed = seeds.element(instanceIndex);

    pos.assign(
      vec3(
        rnd(1).sub(0.5).mul(2.0).mul(BOX_X),
        rnd(100003).sub(0.5).mul(2.0).mul(BOX_Y),
        rnd(200003).sub(0.5).mul(2.0).mul(BOX_Z)
      )
    );
    vel.assign(vec3(0.0, 0.0, 0.0));
    seed.assign(
      vec4(rnd(300007), rnd(400009), rnd(500011), rnd(600013))
    );
  })().compute(count);

  const updateCompute = Fn(() => {
    // WebGL2(transform feedback) では書き込み後の再読み込みが効かないため
    // 必ずローカル変数へ一度読み出してから最後に書き戻す
    const pos = positions.element(instanceIndex).toVar();
    const vel = velocities.element(instanceIndex).toVar();
    const seed = seeds.element(instanceIndex);

    const dt = min(deltaTime, float(0.033)).mul(uSpeed);

    // カールノイズ的な流れ場
    const flow = mx_fractal_noise_vec3(
      pos.mul(0.032).add(vec3(0.0, time.mul(0.02), time.mul(0.014))),
      3,
      2.0,
      0.5
    ).mul(2.6);

    // 浮上（プランクトンの立ち上がり）
    const rise = vec3(0.0, seed.z.mul(1.5).add(0.45), 0.0);

    // ポインタ周りの渦
    const toPointer = uPointer.sub(pos);
    const dist = length(toPointer);
    const dir = toPointer.div(max(dist, float(0.001)));
    const influence = smoothstep(float(26.0), float(0.0), dist).mul(
      uPointerStrength
    );
    const swirl = normalize(
      cross(dir, vec3(0.0, 0.0, 1.0)).add(vec3(0.0, 0.08, 0.0))
    )
      .mul(influence)
      .mul(18.0);
    const pull = dir.mul(influence).mul(5.0);

    const accel = flow.add(rise).add(swirl).add(pull);
    vel.addAssign(accel.sub(vel.mul(1.7)).mul(dt));
    pos.addAssign(vel.mul(dt));

    // 箱の外に出たら反対側から入れ直す
    If(pos.y.greaterThan(float(BOX_Y)), () => {
      pos.assign(vec3(pos.x, float(-BOX_Y), pos.z));
    });
    If(pos.y.lessThan(float(-BOX_Y)), () => {
      pos.assign(vec3(pos.x, float(BOX_Y), pos.z));
    });
    If(pos.x.greaterThan(float(BOX_X)), () => {
      pos.assign(vec3(float(-BOX_X), pos.y, pos.z));
    });
    If(pos.x.lessThan(float(-BOX_X)), () => {
      pos.assign(vec3(float(BOX_X), pos.y, pos.z));
    });
    If(pos.z.greaterThan(float(BOX_Z)), () => {
      pos.assign(vec3(pos.x, pos.y, float(-BOX_Z)));
    });
    If(pos.z.lessThan(float(-BOX_Z)), () => {
      pos.assign(vec3(pos.x, pos.y, float(BOX_Z)));
    });

    positions.element(instanceIndex).assign(pos);
    velocities.element(instanceIndex).assign(vel);
  })().compute(count);

  const particleMaterial = new THREE.SpriteNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  {
    const pos = positions.element(instanceIndex);
    const vel = velocities.element(instanceIndex);
    const seed = seeds.element(instanceIndex);

    particleMaterial.positionNode = pos;
    // ほとんどは微細な粒、ごく一部だけ大きく光る
    particleMaterial.scaleNode = pow(seed.x, float(3.0))
      .mul(0.55)
      .add(0.03)
      .mul(uParticleScale);

    // ガウシアンな光の玉
    const d = uv().sub(vec2(0.5, 0.5)).mul(2.0);
    const core = exp(d.dot(d).mul(-4.2));

    const speedGlow = saturate(length(vel).mul(0.13)).mul(0.7).add(0.35);

    const cyan = vec3(0.10, 0.82, 1.0);
    const indigo = vec3(0.34, 0.40, 1.0);
    const pearl = vec3(0.72, 0.92, 1.0);
    const hue = mix(cyan, indigo, smoothstep(0.35, 1.0, seed.y));
    const tinted = mix(hue, pearl, pow(seed.y, float(8.0)).mul(0.55));

    // 画面中央（見出しが載る帯）は粒子を落として文字を読みやすくする
    const centerGuard = mix(
      float(0.22),
      float(1.0),
      smoothstep(0.10, 0.46, length(screenUV.sub(vec2(0.5, 0.5))))
    );

    particleMaterial.colorNode = tinted.mul(speedGlow).mul(uIntensity);
    particleMaterial.opacityNode = core
      .mul(pow(seed.w, float(2.6)).mul(0.55).add(0.07))
      .mul(centerGuard)
      .mul(uIntensity);
  }

  const particles = new THREE.Sprite(
    particleMaterial as unknown as THREE.SpriteMaterial
  );
  particles.count = count;
  particles.frustumCulled = false;
  scene.add(particles);

  // ── 海面（水中から見上げる） ──────────────────────────────────────────────
  const surfaceGeometry = new THREE.PlaneGeometry(
    460,
    460,
    tier.surfaceSegments,
    tier.surfaceSegments
  );
  const surfaceMaterial = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  {
    const local = positionLocal;
    const w1 = mx_noise_float(
      vec3(local.x.mul(0.035), local.y.mul(0.035), time.mul(0.10))
    );
    const w2 = mx_noise_float(
      vec3(local.x.mul(0.011), local.y.mul(0.013), time.mul(0.055).add(7.0))
    );
    surfaceMaterial.positionNode = vec3(
      local.x,
      local.y,
      w1.mul(1.6).add(w2.mul(4.2))
    );

    const cUv = vec2(local.x.mul(0.055), local.y.mul(0.055));
    const c1 = mx_noise_float(vec3(cUv.x, cUv.y, time.mul(0.075)));
    const c2 = mx_noise_float(
      vec3(cUv.x.mul(2.15).add(4.0), cUv.y.mul(2.15), time.mul(0.10))
    );
    const caustics = pow(saturate(c1.add(c2.mul(0.65)).abs()), float(3.2));

    surfaceMaterial.colorNode = mix(
      vec3(0.004, 0.028, 0.048),
      vec3(0.22, 0.74, 0.96),
      caustics
    ).mul(uIntensity);

    const camDist = length(positionView);
    surfaceMaterial.opacityNode = smoothstep(float(300.0), float(40.0), camDist)
      .mul(0.17)
      .mul(uIntensity);
  }

  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = SURFACE_Y;
  surface.frustumCulled = false;
  scene.add(surface);

  // ── ニューラル格子（AI のモチーフ） ───────────────────────────────────────
  let lattice: THREE.LineSegments | null = null;
  let latticeGeometry: THREE.BufferGeometry | null = null;
  let latticeMaterial: THREE.Material | null = null;

  if (tier.lattice) {
    const source = new THREE.IcosahedronGeometry(7, 2);
    latticeGeometry = new THREE.WireframeGeometry(source);
    source.dispose();

    const mat = new THREE.LineBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const local = positionLocal;
    const dirOut = normalize(local);
    const pulse = mx_noise_float(
      dirOut.mul(1.6).add(vec3(0.0, 0.0, time.mul(0.10)))
    ).mul(1.1);
    mat.positionNode = local.add(dirOut.mul(pulse));
    mat.colorNode = mix(
      vec3(0.20, 0.72, 1.0),
      vec3(0.52, 0.50, 1.0),
      saturate(dirOut.y.mul(0.5).add(0.5))
    );
    mat.opacityNode = float(0.17).mul(uIntensity);
    latticeMaterial = mat;

    lattice = new THREE.LineSegments(latticeGeometry, mat);
    lattice.position.set(34, 10, -40);
    lattice.frustumCulled = false;
    scene.add(lattice);
  }

  // ── ポストプロセス（Bloom） ───────────────────────────────────────────────
  let postProcessing: THREE.RenderPipeline | null = null;
  if (tier.bloom) {
    postProcessing = new THREE.RenderPipeline(renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");
    postProcessing.outputNode = scenePassColor.add(
      bloom(scenePassColor, 0.45, 0.85, 0.3)
    );
  }

  // ── 初期化 compute ────────────────────────────────────────────────────────
  await renderer.computeAsync(initCompute);

  // ── 入力（ポインタ / スクロール） ─────────────────────────────────────────
  const pointerTarget = new THREE.Vector3(0, 0, 8);
  let pointerStrengthTarget = 0;
  let scroll = 0;

  const raycastPlane = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    // z = 8 の平面上へ大まかに投影する
    const planeZ = 8;
    const distance = camera.position.z - planeZ;
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * distance;
    const halfWidth = halfHeight * camera.aspect;
    pointerTarget.set(nx * halfWidth, ny * halfHeight + 6, planeZ);
  };

  const onPointerMove = (event: PointerEvent) => {
    raycastPlane(event.clientX, event.clientY);
    pointerStrengthTarget = 1;
  };
  const onPointerLeave = () => {
    pointerStrengthTarget = 0;
  };
  const onScroll = () => {
    const vh = window.innerHeight || 1;
    scroll = Math.min(window.scrollY / vh, 3);
  };
  const onResize = () => {
    const { w, h } = measure();
    // 非表示タブでは 0 が返ることがあるので直前のサイズを保つ
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
  resizeObserver?.observe(canvas);

  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  onScroll();

  // ── 描画ループ ────────────────────────────────────────────────────────────
  const pointer = new THREE.Vector3(0, 0, 8);
  let frame = 0;
  let disposed = false;

  const draw = () => {
    if (postProcessing) {
      postProcessing.render();
    } else {
      renderer.render(scene, camera);
    }
  };

  // 遅い GPU では自動的に品質を落とす
  let lastFrameTime = performance.now();
  let slowFrames = 0;
  let degraded = 0;

  const watchPerformance = () => {
    const now = performance.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;

    // 最初の数フレームはシェーダーのコンパイルで重いので無視する
    if (frame < 40 || degraded >= 2) return;

    slowFrames = dt > 26 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames < 45) return;

    slowFrames = 0;
    degraded += 1;

    if (degraded === 1 && postProcessing) {
      // まず Bloom を落とす
      postProcessing.dispose();
      postProcessing = null;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
      onResize();
    }
  };

  const animate = () => {
    if (disposed) return;
    frame += 1;
    watchPerformance();

    // ヒーローを抜けたらフレームを間引いてバッテリーを守る
    const heroVisible = scroll < 1.15;
    if (!heroVisible && frame % 2 === 1) return;

    pointer.lerp(pointerTarget, 0.06);
    uPointer.value.copy(pointer);
    uPointerStrength.value +=
      (pointerStrengthTarget - uPointerStrength.value) * 0.05;

    const s = Math.min(scroll, 1);
    camera.position.z = CAMERA_Z + s * 16;
    camera.position.y = s * -7;
    camera.lookAt(0, 6 - s * 4, 0);
    uIntensity.value = 1 - s * 0.45;
    uParticleScale.value = 1 - s * 0.25;

    renderer.compute(updateCompute);
    draw();
  };

  if (reducedMotion) {
    draw();
  } else {
    renderer.setAnimationLoop(animate);
  }

  const onVisibilityChange = () => {
    if (reducedMotion) return;
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      renderer.setAnimationLoop(animate);
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    backend,
    particleCount: count,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);

      postProcessing?.dispose();
      scene.clear();
      surfaceGeometry.dispose();
      surfaceMaterial.dispose();
      particleMaterial.dispose();
      latticeGeometry?.dispose();
      latticeMaterial?.dispose();
      if (lattice) lattice.geometry = new THREE.BufferGeometry();
      renderer.dispose();
    },
  };
}
