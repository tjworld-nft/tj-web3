/**
 * 背景のダイブ・エンジン（WebGL2・3Dライブラリなし）。
 *
 * 1フレームの流れ:
 *   1. 波と発光の計算（ping-pong。カーソルとクリックが水を押す）
 *   2. 背景（空・水面・水中・深海）を低めの解像度で描いて拡大
 *   3. 水面の縁と、水に沈んだ見出しを画面の解像度で重ねる
 *   4. 魚群 → 泡 → 言葉のプランクトン → 言葉のクラゲ
 */

import { dive } from "../diveState";
import { skyForMode, type SkyState } from "../sky";
import { RECREATIONAL_LIMIT } from "../ocean";
import {
    createProgram,
    createTarget,
    createTextureFromCanvas,
    deleteTarget,
    type Program,
    type Target,
} from "./gl";
import {
    BLIT_FS,
    BUBBLE_FS,
    BUBBLE_VS,
    FISH_FS,
    FISH_VS,
    FULLSCREEN_VS,
    JELLY_FS,
    JELLY_VS,
    MAX_ANCHORS,
    PARTICLE_FS,
    PARTICLE_VS,
    SIM_FS,
    SURFACE_FS,
    WORLD_FS,
    waveOffset,
} from "./shaders";
import { buildGlyphAtlas, TENTACLE_WORDS, type GlyphAtlas } from "./glyphs";
import { drawHeadline, type HeadlineTexture } from "./headline";

export type DiveEngineOptions = {
    canvas: HTMLCanvasElement;
    reducedMotion: boolean;
    headline: HTMLElement | null;
    /** 見出しを水面で切る（水面より上だけ HTML を見せる） */
    clipHeadline: (poly: string | null) => void;
};

export type DiveEngine = {
    dispose: () => void;
    refreshHeadline: () => void;
    stats: () => { fps: number; scale: number; particles: number };
};

type Bubble = { x: number; y: number; r0: number; p0: number; vy: number; ph: number; age: number; life: number };

/* ───────── 空の色（太陽高度のキーフレームを補間） ───────── */

type SkyKey = { e: number; zenith: number[]; horizon: number[]; sun: number[]; light: number };
const SKY_KEYS: SkyKey[] = [
    { e: -18, zenith: [0.012, 0.03, 0.08], horizon: [0.035, 0.07, 0.14], sun: [0.4, 0.5, 0.75], light: 0.08 },
    { e: -6, zenith: [0.06, 0.08, 0.2], horizon: [0.32, 0.2, 0.33], sun: [1.0, 0.5, 0.35], light: 0.12 },
    { e: 0, zenith: [0.14, 0.22, 0.45], horizon: [0.98, 0.56, 0.36], sun: [1.0, 0.62, 0.34], light: 0.32 },
    { e: 6, zenith: [0.2, 0.36, 0.62], horizon: [1.0, 0.72, 0.5], sun: [1.0, 0.78, 0.5], light: 0.58 },
    { e: 16, zenith: [0.18, 0.44, 0.78], horizon: [0.86, 0.86, 0.84], sun: [1.0, 0.9, 0.72], light: 0.85 },
    { e: 40, zenith: [0.14, 0.44, 0.84], horizon: [0.72, 0.87, 0.96], sun: [1.0, 0.96, 0.86], light: 1.0 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

function skyUniforms(sky: SkyState) {
    const e = sky.sunElevation;
    let i = 0;
    while (i < SKY_KEYS.length - 2 && e > SKY_KEYS[i + 1].e) i++;
    const a = SKY_KEYS[i];
    const b = SKY_KEYS[i + 1];
    const t = Math.min(1, Math.max(0, (e - a.e) / (b.e - a.e)));
    const mix3 = (p: number[], q: number[]) => p.map((v, k) => lerp(v, q[k], t));
    // カメラは西南西（255°）を向いている（水平の画角90°）。富士山は方位およそ287°
    const sunX = 0.5 + (sky.sunAzimuth - 255) / 90;
    return {
        zenith: mix3(a.zenith, b.zenith),
        horizon: mix3(a.horizon, b.horizon),
        sunCol: mix3(a.sun, b.sun),
        light: lerp(a.light, b.light, t),
        night: 1 - smooth(-11, -3, e),
        golden: smooth(-5, 2, e) * (1 - smooth(9, 20, e)),
        sunX,
        sunStrength: smooth(-4, 1, e) * (1 - 0.55 * smooth(20, 60, e)) * (Math.abs(sunX - 0.5) < 1.2 ? 1 : 0.3),
        moon: 0.5 - 0.5 * Math.cos(sky.moonPhase * Math.PI * 2),
    };
}

/* ───────── ジオメトリ ───────── */

function makeFishMesh() {
    // x: 前後（鼻先=+1）/ y: 背と腹 / z: 尾（1で尾）
    const nose = [1, 0, 0];
    const top = [0.2, 0.15, 0];
    const bot = [0.2, -0.15, 0];
    const joint = [-0.55, 0, 0.6];
    const tt = [-0.9, 0.2, 1];
    const tb = [-0.9, -0.2, 1];
    return new Float32Array([...nose, ...top, ...bot, ...top, ...joint, ...bot, ...joint, ...tt, ...tb]);
}

function makeJelly(atlas: GlyphAtlas, words: string[], rng: () => number) {
    const pts: number[] = [];
    const glyph: number[] = [];
    // 傘
    const bellN = 620;
    for (let i = 0; i < bellN; i++) {
        const ph = Math.sqrt(rng());
        const th = rng() * Math.PI * 2;
        pts.push(0, th, ph, rng());
        glyph.push(-1);
    }
    // 触手（一本に一語）
    const n = words.length;
    words.forEach((w, k) => {
        const th = (k / n) * Math.PI * 2 + rng() * 0.3;
        const letters = w.split("");
        const L = letters.length;
        const extra = 10 + Math.floor(rng() * 8);
        for (let j = 0; j < L + extra; j++) {
            const s = (j + 0.5) / (L + extra);
            pts.push(1, th, s, rng());
            glyph.push(j < L ? atlas.index.get(letters[j]) ?? -1 : -1);
        }
    });
    // 口腕
    for (let k = 0; k < 4; k++) {
        const th = (k / 4) * Math.PI * 2 + 0.4;
        for (let j = 0; j < 26; j++) pts.push(2, th, j / 26, rng());
        for (let j = 0; j < 26; j++) glyph.push(-1);
    }
    // 傘の内側の光
    pts.push(3, 0, 0, 0);
    glyph.push(-1);
    return { pts: new Float32Array(pts), glyph: new Float32Array(glyph), count: glyph.length };
}

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ───────── 本体 ───────── */

export async function createDiveEngine(opts: DiveEngineOptions): Promise<DiveEngine> {
    const { canvas, reducedMotion } = opts;
    const gl = canvas.getContext("webgl2", {
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("[dive] WebGL2 unavailable");

    const isMobile = matchMedia("(pointer: coarse)").matches || Math.min(screen.width, screen.height) < 700;

    // 16bit 浮動小数のレンダーターゲットが使えるか（波動方程式に要る）
    const floatOK = !!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"));
    const maxPoint = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | null)?.[1] ?? 64;

    // 並列コンパイル（使えれば）: 全部を投げてから、終わるまでフレームをまたいで待つ
    const parallel = gl.getExtension("KHR_parallel_shader_compile");
    const programs = {
        world: createProgram(gl, FULLSCREEN_VS, WORLD_FS, "world", { aPos: 0 }),
        surface: createProgram(gl, FULLSCREEN_VS, SURFACE_FS, "surface", { aPos: 0 }),
        sim: createProgram(gl, FULLSCREEN_VS, SIM_FS, "sim", { aPos: 0 }),
        blit: createProgram(gl, FULLSCREEN_VS, BLIT_FS, "blit", { aPos: 0 }),
        particles: createProgram(gl, PARTICLE_VS, PARTICLE_FS, "particles", { aSeed: 0, aGlyph: 1 }),
        fish: createProgram(gl, FISH_VS, FISH_FS, "fish", { aLocal: 0, aSeed: 1 }),
        bubbles: createProgram(gl, BUBBLE_VS, BUBBLE_FS, "bubbles", { aBubble: 0 }),
        jelly: createProgram(gl, JELLY_VS, JELLY_FS, "jelly", { aP: 0, aGlyph: 1 }),
    };
    if (parallel) {
        const list = Object.values(programs);
        const t0 = performance.now();
        while (!list.every((p) => p.ready(parallel)) && performance.now() - t0 < 20000) {
            await new Promise((r) => setTimeout(r, 32));
        }
    }
    for (const p of Object.values(programs)) p.check();

    /* 全画面の三角形 */
    const quadVao = gl.createVertexArray();
    const quadBuf = gl.createBuffer();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    /* 文字のアトラス */
    const atlas = await buildGlyphAtlas();
    const atlasTex = createTextureFromCanvas(gl, atlas.canvas, true);
    atlas.canvas.width = atlas.canvas.height = 0; // GPU に載せたら 2D キャンバスは手放す（iOS のメモリ対策）

    /* プランクトン */
    const particleCount = reducedMotion ? 2600 : isMobile ? 3600 : 7200;
    const rng = mulberry32(1997);
    const seeds = new Float32Array(particleCount * 4);
    const glyphIdx = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
        seeds[i * 4] = rng();
        seeds[i * 4 + 1] = rng();
        seeds[i * 4 + 2] = Math.pow(rng(), 1.6);
        seeds[i * 4 + 3] = rng();
        glyphIdx[i] = atlas.plankton[Math.floor(rng() * atlas.plankton.length)];
    }
    const pVao = gl.createVertexArray();
    gl.bindVertexArray(pVao);
    const pSeedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pSeedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    const pGlyphBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pGlyphBuf);
    gl.bufferData(gl.ARRAY_BUFFER, glyphIdx, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

    /* 魚群 */
    const fishCount = isMobile ? 130 : 240;
    const fVao = gl.createVertexArray();
    gl.bindVertexArray(fVao);
    const fMeshBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fMeshBuf);
    gl.bufferData(gl.ARRAY_BUFFER, makeFishMesh(), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const fSeeds = new Float32Array(fishCount * 4);
    for (let i = 0; i < fishCount * 4; i++) fSeeds[i] = rng();
    const fSeedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fSeedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, fSeeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    /* 泡 */
    const MAX_BUBBLES = 260;
    const bubbleData = new Float32Array(MAX_BUBBLES * 4);
    const bVao = gl.createVertexArray();
    gl.bindVertexArray(bVao);
    const bBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuf);
    gl.bufferData(gl.ARRAY_BUFFER, bubbleData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    const bubbles: Bubble[] = [];

    /* 言葉のクラゲ（深さはあとで data-depth から位置を引く） */
    const JELLIES = [
        { depth: 66, x: 0.86, size: 128, words: [0, 1, 2, 3, 4], tint: [0.5, 0.95, 1.0] },
        { depth: 190, x: 0.1, size: 92, words: [5, 6, 7, 8], tint: [0.75, 0.62, 1.0] },
        { depth: 360, x: 0.9, size: 150, words: [9, 10, 11, 12, 13], tint: [0.45, 1.0, 0.92] },
        { depth: 640, x: 0.08, size: 110, words: [0, 12, 6, 3], tint: [1.0, 0.6, 0.86] },
        { depth: 900, x: 0.86, size: 136, words: [9, 1, 4, 10, 11], tint: [0.55, 0.9, 1.0] },
    ].map((j, k) => {
        const geo = makeJelly(atlas, j.words.map((w) => TENTACLE_WORDS[w]), mulberry32(40 + k));
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const b0 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b0);
        gl.bufferData(gl.ARRAY_BUFFER, geo.pts, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
        const b1 = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b1);
        gl.bufferData(gl.ARRAY_BUFFER, geo.glyph, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
        return { ...j, vao, buffers: [b0, b1], count: geo.count, phase: k * 1.7 };
    });
    gl.bindVertexArray(null);

    /* 見出しのテクスチャ */
    let disposed = false;
    let headlineTex: WebGLTexture | null = null;
    let headline: HeadlineTexture | null = null;
    const refreshHeadline = () => {
        if (disposed || !opts.headline) return;
        const h = drawHeadline(opts.headline);
        if (!h) return;
        const tex = createTextureFromCanvas(gl, h.canvas);
        if (headlineTex) gl.deleteTexture(headlineTex);
        headlineTex = tex;
        h.canvas.width = h.canvas.height = 0;
        headline = h;
    };

    /* レンダーターゲット */
    let worldTarget: Target | null = null;
    let simA: Target | null = null;
    let simB: Target | null = null;
    let simW = 0;
    let simH = 0;
    const simFormat = floatOK
        ? { internalFormat: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT, filter: gl.LINEAR }
        : { internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, filter: gl.LINEAR };
    const wavesOn = floatOK && !reducedMotion;

    const dprScale = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
    let quality = 1; // 0.55 .. 1（重いときだけ下げる）
    let heroMode = window.scrollY < window.innerHeight * 0.9;
    let cssW = Math.max(1, canvas.clientWidth);
    let cssH = Math.max(1, canvas.clientHeight);

    const clearTarget = (t: Target) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.viewport(0, 0, t.width, t.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const resize = () => {
        const pr = dprScale * quality;
        const w = Math.round(cssW * pr);
        const h = Math.round(cssH * pr);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        // 水面が映っている間は、水平線や富士山の輪郭のために解像度を上げる
        const ws = (heroMode ? (isMobile ? 0.62 : 0.85) : isMobile ? 0.42 : 0.55) * Math.max(0.7, quality);
        const tw = Math.max(64, Math.round(cssW * ws));
        const th = Math.max(64, Math.round(cssH * ws));
        if (!worldTarget || worldTarget.width !== tw || worldTarget.height !== th) {
            deleteTarget(gl, worldTarget);
            worldTarget = createTarget(gl, tw, th, {
                internalFormat: gl.RGBA8,
                format: gl.RGBA,
                type: gl.UNSIGNED_BYTE,
                filter: gl.LINEAR,
            });
        }
        const sw = isMobile ? 144 : 200;
        const sh = Math.max(64, Math.round(sw * (cssH / cssW)));
        // 高さの小さな変化（スマホのツールバーの出入り）では、波を作り直さない
        if (sw !== simW || Math.abs(sh - simH) > simH * 0.12) {
            deleteTarget(gl, simA);
            deleteTarget(gl, simB);
            simA = createTarget(gl, sw, sh, simFormat);
            simB = createTarget(gl, sw, sh, simFormat);
            clearTarget(simA);
            clearTarget(simB);
            simW = sw;
            simH = sh;
        }
    };
    resize();
    refreshHeadline();

    // キャンバスの大きさは ResizeObserver で見張る（毎フレーム clientWidth を読まない）
    let sizeDirty = false;
    let widthChanged = false;
    const ro = new ResizeObserver((entries) => {
        const r = entries[0]?.contentRect;
        if (!r) return;
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        if (w !== cssW) widthChanged = true;
        if (w !== cssW || h !== cssH) {
            cssW = w;
            cssH = h;
            sizeDirty = true;
        }
    });
    ro.observe(canvas);

    /* 状態 */
    let raf = 0;
    let last = performance.now();
    let frameAvg = 16.7;
    let vsync = 16.7; // 画面の書き換え間隔の見積もり（最近の最短）
    let vsyncWindowMin = 1e9;
    let vsyncWindowCount = 0;
    let fpsAvg = 60;
    let lastSimScroll = window.scrollY;
    let lastPointer = { x: dive.pointerX, y: dive.pointerY };
    let lastPointerActive = false;
    let simAccum = 0;
    let sky = skyForMode(dive.timeMode);
    let skyU = skyUniforms(sky);
    let skyAt = 0;
    let skyMode = dive.timeMode;
    let idleSince = performance.now();
    let wasIdle = false;
    let lastInputKey = "";
    let waterDoc = 0; // 水面の基準（ドキュメント y）
    let lastClip = "";
    let clipTick = 0;
    let frameSkip = false;
    let lastQualityChange = performance.now();
    let heavySince = 0;
    let lightSince = 0;
    const freezeTime = reducedMotion ? 12.0 : null;
    const SIM_STEP = 1 / 60;

    const measureWater = () => {
        const el = document.querySelector<HTMLElement>("[data-waterline]");
        if (!el) {
            waterDoc = -1e5;
            return;
        }
        const r = el.getBoundingClientRect();
        waterDoc = r.top + window.scrollY + r.height * 0.56;
    };
    measureWater();

    // 水深の目印は、変わったときだけ詰め直す。各プログラムへの送り直しも、変わったときだけ
    let anchorRef: unknown = null;
    let anchorVersion = 0;
    const anchorArr = new Float32Array(MAX_ANCHORS * 2);
    let anchorCount = 0;
    const uploaded = new WeakMap<Program, number>();
    const syncAnchors = () => {
        if (dive.anchors === anchorRef) return;
        anchorRef = dive.anchors;
        anchorVersion++;
        anchorArr.fill(0);
        const a = dive.anchors;
        anchorCount = Math.min(MAX_ANCHORS, a.length);
        for (let i = 0; i < anchorCount; i++) {
            anchorArr[i * 2] = a[i].y;
            anchorArr[i * 2 + 1] = a[i].depth;
        }
    };
    const setAnchors = (p: Program) => {
        if (uploaded.get(p) === anchorVersion) return;
        uploaded.set(p, anchorVersion);
        gl.uniform2fv(p.u("uAnchors"), anchorArr);
        gl.uniform1i(p.u("uAnchorCount"), anchorCount);
    };

    const spawnBubbles = (x: number, y: number, n: number, big = 1) => {
        dive.bubbles += n;
        for (let i = 0; i < n && bubbles.length < MAX_BUBBLES; i++) {
            const r0 = (1.5 + Math.random() * 4.5) * big;
            const docY = dive.scrollY + y + (Math.random() - 0.5) * 10;
            bubbles.push({
                x: x + (Math.random() - 0.5) * 16 * big,
                y: docY,
                r0,
                p0: 1 + Math.max(0, dive.depthAt(docY)) / 10,
                vy: 40 + Math.sqrt(r0) * 34 + Math.random() * 20,
                ph: Math.random() * 6.28,
                age: 0,
                life: 7 + Math.random() * 5,
            });
        }
    };

    const fail = (err: unknown) => {
        console.warn("[dive] 描画を止めました（CSS の海に戻します）", err);
        disposed = true;
        cancelAnimationFrame(raf);
        opts.clipHeadline(null);
        canvas.dispatchEvent(new CustomEvent("dive:lost"));
    };

    const frame = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(frame);
        try {
            render(now);
        } catch (err) {
            fail(err);
        }
    };

    const render = (now: number) => {
        // 何も起きていない時間が続いたら30fpsに落とす
        const key = `${Math.round(dive.scrollY)}|${Math.round(dive.pointerX)}|${Math.round(dive.pointerY)}`;
        if (key !== lastInputKey) {
            lastInputKey = key;
            idleSince = now;
        }
        const idle = now - idleSince > 6000;
        if (idle) {
            frameSkip = !frameSkip;
            if (frameSkip) return;
        }
        const interval = now - last;
        last = now;
        const dt = Math.min(0.05, interval / 1000);

        // フレーム時間（間引いている間と、その直後は数えない）
        if (!idle && !wasIdle) {
            frameAvg = frameAvg * 0.94 + Math.min(100, interval) * 0.06;
            vsyncWindowMin = Math.min(vsyncWindowMin, interval);
            if (++vsyncWindowCount >= 90) {
                vsync = Math.max(4, Math.min(34, vsyncWindowMin));
                vsyncWindowMin = 1e9;
                vsyncWindowCount = 0;
            }
        } else if (!idle && wasIdle) {
            frameAvg = vsync;
        }
        wasIdle = idle;
        fpsAvg = 1000 / Math.max(1, frameAvg);

        // 画質の自動調整: 書き換え間隔より明らかに遅い状態が続けば下げ、余裕が続けば戻す
        if (!idle) {
            if (frameAvg > vsync * 1.4) {
                heavySince ||= now;
                lightSince = 0;
            } else if (frameAvg < vsync * 1.12) {
                lightSince ||= now;
                heavySince = 0;
            } else {
                heavySince = 0;
                lightSince = 0;
            }
            if (heavySince && now - heavySince > 1500 && quality > 0.55 && now - lastQualityChange > 1500) {
                quality = Math.max(0.55, quality - 0.1);
                lastQualityChange = now;
                heavySince = 0;
                frameAvg = vsync;
                resize();
            } else if (lightSince && now - lightSince > 3500 && quality < 1 && now - lastQualityChange > 3500) {
                quality = Math.min(1, quality + 0.1);
                lastQualityChange = now;
                lightSince = 0;
                resize();
            }
        }

        if (sizeDirty) {
            sizeDirty = false;
            resize();
            if (widthChanged) {
                widthChanged = false;
                measureWater();
                refreshHeadline();
            }
        }

        syncAnchors();
        const t = freezeTime ?? now / 1000;
        const scroll = dive.scrollY;

        if (dive.timeMode !== skyMode || now - skyAt > 20000) {
            skyMode = dive.timeMode;
            skyAt = now;
            sky = skyForMode(dive.timeMode);
            skyU = skyUniforms(sky);
        }

        const waveScale = Math.min(1.4, Math.max(0.65, Math.min(cssW, cssH) / 900));
        const waterY = waterDoc - scroll * 1.55;
        const wantHero = waterY > -60;
        if (wantHero !== heroMode) {
            heroMode = wantHero;
            resize();
        }
        const haloDoc = dive.yAtDepth(RECREATIONAL_LIMIT);
        const pointerOn = dive.pointerActive ? 1 : 0;

        /* 1. 波と発光（1/60秒きざみ。1フレームで最大2歩） */
        if (simA && simB) {
            // カーソルが今まさに現れた／大きく飛んだときは、線を引かない
            const jump = Math.hypot(dive.pointerX - lastPointer.x, dive.pointerY - lastPointer.y);
            if (!dive.pointerActive || !lastPointerActive || jump > Math.min(cssW, cssH) * 0.25) {
                lastPointer = { x: dive.pointerX, y: dive.pointerY };
            }
            lastPointerActive = dive.pointerActive;
            const moved = Math.hypot(dive.pointerX - lastPointer.x, dive.pointerY - lastPointer.y);
            const strength = dive.pointerActive && !reducedMotion ? Math.min(0.9, moved / 60) : 0;
            const pulse = dive.pulses.shift();

            simAccum = Math.min(simAccum + dt, SIM_STEP * 2);
            let steps = 0;
            if (simAccum >= SIM_STEP || strength > 0 || pulse) {
                steps = Math.max(1, Math.floor(simAccum / SIM_STEP));
                simAccum = Math.max(0, simAccum - steps * SIM_STEP);
            }
            const sp = programs.sim;
            for (let k = 0; k < steps; k++) {
                const first = k === 0;
                gl.useProgram(sp.program);
                gl.bindFramebuffer(gl.FRAMEBUFFER, simB.fbo);
                gl.viewport(0, 0, simB.width, simB.height);
                gl.disable(gl.BLEND);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, simA.tex);
                gl.uniform1i(sp.u("uPrev"), 0);
                gl.uniform2f(sp.u("uTexel"), 1 / simA.width, 1 / simA.height);
                gl.uniform1f(sp.u("uShift"), first ? (scroll - lastSimScroll) / cssH : 0);
                // シミュレーションは GL の向き（y 上向き）
                gl.uniform2f(sp.u("uP0"), lastPointer.x / cssW, 1 - lastPointer.y / cssH);
                gl.uniform2f(sp.u("uP1"), dive.pointerX / cssW, 1 - dive.pointerY / cssH);
                gl.uniform1f(sp.u("uPStrength"), first ? strength : 0);
                gl.uniform1f(sp.u("uPRadius"), 0.016);
                gl.uniform1f(sp.u("uAspect"), cssW / cssH);
                gl.uniform1f(sp.u("uWaves"), wavesOn ? 1 : 0);
                gl.uniform1f(sp.u("uGlowFloor"), floatOK ? 0 : 1.5 / 255);
                if (first && pulse && !reducedMotion) {
                    gl.uniform4f(sp.u("uPulse"), pulse.x / cssW, 1 - pulse.y / cssH, pulse.strength, 0.018);
                } else {
                    gl.uniform4f(sp.u("uPulse"), 0, 0, 0, 0.02);
                }
                gl.bindVertexArray(quadVao);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                [simA, simB] = [simB, simA];
            }
            if (steps > 0) lastSimScroll = scroll;

            // 浅い所では、動かしたカーソルから泡が出る（吐く息）
            if (!reducedMotion && dive.pointerActive) {
                const pDepth = dive.depthAt(scroll + dive.pointerY);
                const underwater = dive.pointerY > waterY + 10;
                if (underwater && pDepth < RECREATIONAL_LIMIT - 2 && moved > 8 && Math.random() < Math.min(0.9, moved / 40)) {
                    spawnBubbles(dive.pointerX, dive.pointerY, 1);
                }
            }
            if (pulse && !reducedMotion) {
                const pDepth = dive.depthAt(scroll + pulse.y);
                if (pulse.y > waterY + 10 && pDepth < RECREATIONAL_LIMIT - 2) spawnBubbles(pulse.x, pulse.y, 16, 1.3);
            }
            lastPointer = { x: dive.pointerX, y: dive.pointerY };
        }

        /* 2. 背景 */
        if (worldTarget) {
            const p = programs.world;
            gl.useProgram(p.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, worldTarget.fbo);
            gl.viewport(0, 0, worldTarget.width, worldTarget.height);
            gl.disable(gl.BLEND);
            gl.uniform2f(p.u("uView"), cssW, cssH);
            gl.uniform1f(p.u("uScroll"), scroll);
            gl.uniform1f(p.u("uTime"), t);
            gl.uniform1f(p.u("uWaterY"), waterY);
            gl.uniform1f(p.u("uWaveScale"), waveScale);
            gl.uniform3fv(p.u("uZenith"), skyU.zenith);
            gl.uniform3fv(p.u("uHorizon"), skyU.horizon);
            gl.uniform3fv(p.u("uSunCol"), skyU.sunCol);
            gl.uniform4f(p.u("uSun"), skyU.sunX, sky.sunElevation, skyU.sunStrength, skyU.moon);
            gl.uniform1f(p.u("uLight"), skyU.light);
            gl.uniform1f(p.u("uNight"), skyU.night);
            gl.uniform1f(p.u("uGolden"), skyU.golden);
            gl.uniform1f(p.u("uMoonPhase"), sky.moonPhase);
            gl.uniform2f(p.u("uPointer"), dive.pointerX, dive.pointerY);
            gl.uniform1f(p.u("uPointerOn"), pointerOn);
            gl.uniform1f(p.u("uHaloY"), haloDoc);
            gl.uniform1f(p.u("uSimOn"), simA ? 1 : 0);
            if (simA) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, simA.tex);
                gl.uniform1i(p.u("uSim"), 0);
                gl.uniform2f(p.u("uSimTexel"), 1 / simA.width, 1 / simA.height);
            }
            setAnchors(p);
            gl.bindVertexArray(quadVao);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // 拡大して画面へ
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            const b = programs.blit;
            gl.useProgram(b.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, worldTarget.tex);
            gl.uniform1i(b.u("uTex"), 0);
            gl.uniform1f(b.u("uTime"), t);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        const dpr = canvas.width / cssW;

        /* 3. 水面の縁と沈んだ見出し */
        const waterVisible = waterY > -40 && waterY < cssH + 40;
        const textOn = !!(headline && headlineTex);
        let textOnScreen = false;
        if (textOn && headline) {
            const top = headline.rect.y - scroll;
            const bottom = top + headline.rect.h * 1.1;
            // 見出しが画面にあって、その一部でも水の中にあるあいだ
            textOnScreen = top < cssH && bottom > Math.max(0, waterY);
        }
        if (waterVisible || textOnScreen) {
            const p = programs.surface;
            gl.useProgram(p.program);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniform2f(p.u("uView"), cssW, cssH);
            gl.uniform1f(p.u("uScroll"), scroll);
            gl.uniform1f(p.u("uTime"), t);
            gl.uniform1f(p.u("uWaterY"), waterY);
            gl.uniform1f(p.u("uWaveScale"), waveScale);
            gl.uniform1f(p.u("uLight"), skyU.light);
            gl.uniform1f(p.u("uSimOn"), simA ? 1 : 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, simA ? simA.tex : null);
            gl.uniform1i(p.u("uSim"), 0);
            gl.uniform1f(p.u("uTextOn"), textOn ? 1 : 0);
            if (textOn && headline) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, headlineTex);
                gl.uniform1i(p.u("uText"), 1);
                gl.uniform4f(p.u("uTextRect"), headline.rect.x, headline.rect.y, headline.rect.w, headline.rect.h);
            }
            setAnchors(p);
            gl.bindVertexArray(quadVao);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        // 見出しを水面で切る（HTMLの文字は水面より上だけ見せる）。書き換えは30Hzまで
        if (opts.headline && headline && (clipTick++ & 1) === 0) {
            const top = headline.rect.y + 24 - scroll; // 見出しの上端（screen）
            const left = headline.rect.x + 24;
            const w = headline.rect.w - 48;
            const hgt = headline.rect.h - 48;
            let clip: string | null = null;
            if (waterY < top - 30) {
                clip = "inset(0 0 100% 0)"; // すっかり水の中
            } else if (waterY < top + hgt + 30) {
                const pts: string[] = ["0px -40px", `${w.toFixed(1)}px -40px`];
                const N = 28;
                for (let i = N; i >= 0; i--) {
                    const x = (w * i) / N;
                    const y = waterY + waveOffset(left + x, t, waveScale) - top;
                    pts.push(`${x.toFixed(1)}px ${y.toFixed(1)}px`);
                }
                clip = `polygon(${pts.join(",")})`;
            }
            if ((clip ?? "") !== lastClip) {
                lastClip = clip ?? "";
                opts.clipHeadline(clip);
            }
        }

        /* 4a. 魚群（光の届く海） */
        const schoolDoc = dive.yAtDepth(16);
        const schoolScreen = schoolDoc - scroll;
        if (schoolScreen > -cssH * 0.8 && schoolScreen < cssH * 1.8) {
            const p = programs.fish;
            gl.useProgram(p.program);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniform2f(p.u("uView"), cssW, cssH);
            gl.uniform1f(p.u("uScroll"), scroll);
            gl.uniform1f(p.u("uTime"), t);
            gl.uniform2f(p.u("uCenter"), cssW * 0.62, schoolDoc);
            gl.uniform1f(p.u("uRadius"), Math.min(cssW, 1100) * (isMobile ? 0.34 : 0.22));
            gl.uniform2f(p.u("uPointer"), dive.pointerX, dive.pointerY);
            gl.uniform1f(p.u("uPointerOn"), pointerOn);
            gl.uniform1f(p.u("uDpr"), dpr);
            gl.uniform1f(p.u("uLight"), skyU.light);
            setAnchors(p);
            gl.bindVertexArray(fVao);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 9, fishCount);
        }

        /* 4b. 泡 */
        if (bubbles.length) {
            let n = 0;
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const bb = bubbles[i];
                bb.age += dt;
                const d = Math.max(0, dive.depthAt(bb.y));
                const pNow = 1 + d / 10;
                const r = bb.r0 * Math.cbrt(bb.p0 / pNow); // ボイルの法則: 浮くほど膨らむ
                bb.y -= bb.vy * dt * (1 + r * 0.03);
                bb.x += Math.sin(bb.age * 5 + bb.ph) * 18 * dt * (0.6 + r * 0.08);
                const sy = bb.y - scroll;
                const surfaced = sy < waterY + 2;
                if (bb.age > bb.life || sy < -30 || surfaced) {
                    bubbles.splice(i, 1);
                    continue;
                }
                const fade = Math.min(1, bb.age * 4) * Math.min(1, (bb.life - bb.age) * 1.5);
                bubbleData[n * 4] = bb.x;
                bubbleData[n * 4 + 1] = sy;
                bubbleData[n * 4 + 2] = r;
                bubbleData[n * 4 + 3] = fade * 0.9;
                n++;
            }
            if (n > 0) {
                const p = programs.bubbles;
                gl.useProgram(p.program);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.uniform2f(p.u("uView"), cssW, cssH);
                gl.uniform1f(p.u("uDpr"), dpr);
                gl.bindVertexArray(bVao);
                gl.bindBuffer(gl.ARRAY_BUFFER, bBuf);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, bubbleData, 0, n * 4);
                gl.drawArrays(gl.POINTS, 0, n);
            }
        }

        /* 4c. プランクトン（雪 → 言葉） */
        {
            const p = programs.particles;
            gl.useProgram(p.program);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.uniform2f(p.u("uView"), cssW, cssH);
            gl.uniform1f(p.u("uScroll"), scroll);
            gl.uniform1f(p.u("uTime"), t);
            gl.uniform1f(p.u("uDpr"), dpr);
            gl.uniform1f(p.u("uWaterY"), waterY);
            gl.uniform1f(p.u("uSimOn"), simA ? 1 : 0);
            gl.uniform2f(p.u("uPointer"), dive.pointerX, dive.pointerY);
            gl.uniform1f(p.u("uPointerOn"), pointerOn);
            gl.uniform1f(p.u("uLight"), skyU.light);
            gl.uniform1f(p.u("uNight"), skyU.night);
            gl.uniform1f(p.u("uAtlasGrid"), atlas.grid);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, simA ? simA.tex : null);
            gl.uniform1i(p.u("uSim"), 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, atlasTex);
            gl.uniform1i(p.u("uAtlas"), 1);
            setAnchors(p);
            gl.bindVertexArray(pVao);
            gl.drawArrays(gl.POINTS, 0, particleCount);
        }

        /* 4d. 言葉のクラゲ */
        {
            const p = programs.jelly;
            let used = false;
            for (const j of JELLIES) {
                const docY = dive.yAtDepth(j.depth);
                // 本文より少しだけ遅れて動く（奥にいるように見せる）
                const sy = (docY - scroll) * 0.9 + Math.sin(t * 0.18 + j.phase) * 30;
                const size = j.size * (isMobile ? 0.7 : 1) * Math.min(1.2, Math.max(0.75, cssW / 1440));
                if (sy < -size * 5 || sy > cssH + size * 2) continue;
                if (!used) {
                    used = true;
                    gl.useProgram(p.program);
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE);
                    gl.uniform2f(p.u("uView"), cssW, cssH);
                    gl.uniform1f(p.u("uTime"), t);
                    gl.uniform1f(p.u("uDpr"), dpr);
                    gl.uniform1f(p.u("uMaxPoint"), maxPoint);
                    gl.uniform1f(p.u("uAtlasGrid"), atlas.grid);
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
                    gl.uniform1i(p.u("uAtlas"), 1);
                }
                const x = cssW * j.x + Math.sin(t * 0.07 + j.phase) * cssW * 0.02;
                const near = dive.pointerActive ? Math.hypot(dive.pointerX - x, dive.pointerY - sy) : 1e9;
                gl.uniform3f(p.u("uJelly"), x, sy, size);
                gl.uniform1f(p.u("uPhase"), j.phase);
                gl.uniform3f(p.u("uTint"), j.tint[0], j.tint[1], j.tint[2]);
                gl.uniform1f(p.u("uFlash"), Math.exp(-(near * near) / (size * size * 6)) * 0.9);
                gl.bindVertexArray(j.vao);
                gl.drawArrays(gl.POINTS, 0, j.count);
            }
        }

        gl.bindVertexArray(null);
    };

    const onContextLost = (e: Event) => {
        // 既定の動作を止めると、ブラウザが復帰（webglcontextrestored）を試みる。復帰したら DiveWorld が作り直す
        e.preventDefault();
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(raf);
        opts.clipHeadline(null);
        canvas.dispatchEvent(new CustomEvent("dive:lost"));
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    raf = requestAnimationFrame(frame);

    return {
        dispose: () => {
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            canvas.removeEventListener("webglcontextlost", onContextLost);
            opts.clipHeadline(null);
            if (gl.isContextLost()) return;
            // キャンバスはこのあと作り直しに使うことがあるので、コンテキストは失わせずに中身だけ消す
            deleteTarget(gl, worldTarget);
            deleteTarget(gl, simA);
            deleteTarget(gl, simB);
            gl.deleteTexture(atlasTex);
            if (headlineTex) gl.deleteTexture(headlineTex);
            for (const b of [quadBuf, pSeedBuf, pGlyphBuf, fMeshBuf, fSeedBuf, bBuf]) gl.deleteBuffer(b);
            for (const v of [quadVao, pVao, fVao, bVao]) gl.deleteVertexArray(v);
            for (const j of JELLIES) {
                gl.deleteVertexArray(j.vao);
                for (const b of j.buffers) gl.deleteBuffer(b);
            }
            for (const pr of Object.values(programs)) gl.deleteProgram(pr.program);
        },
        refreshHeadline: () => {
            if (disposed) return;
            measureWater();
            refreshHeadline();
        },
        stats: () => ({ fps: fpsAvg, scale: quality * dprScale, particles: particleCount }),
    };
}
