/**
 * GLSL ES 3.00。座標はすべて CSS px（左上原点・y下向き）でそろえている。
 *   screen … ビューポート上の位置
 *   doc    … ドキュメント上の位置（= scroll + screen.y）
 * 水深はドキュメント上の y から depthAt() で引く（HTMLの data-depth の目印を線形補間）。
 */

export const MAX_ANCHORS = 16;

/** 共通: 水深・ノイズ・波形（波形は JS 側 waveOffset() と同じ式） */
const COMMON = /* glsl */ `
#define MAX_ANCHORS ${MAX_ANCHORS}
uniform vec2 uAnchors[MAX_ANCHORS];
uniform int uAnchorCount;

float depthAt(float y) {
    vec2 a0 = uAnchors[0];
    if (y <= a0.x) return a0.y;
    for (int i = 1; i < MAX_ANCHORS; i++) {
        if (i >= uAnchorCount) break;
        vec2 a1 = uAnchors[i];
        if (y <= a1.x) {
            float t = (y - a0.x) / max(1.0, a1.x - a0.x);
            return mix(a0.y, a1.y, t);
        }
        a0 = a1;
    }
    return a0.y;
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
        mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
        u.y);
}

float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        s += a * vnoise(p);
        p = p * 2.03 + vec2(1.7, 9.2);
        a *= 0.5;
    }
    return s;
}

// 水面の上下（px）。JS の waveOffset() と同じ式にしておくこと
float waveOffset(float x, float t, float s) {
    return s * (4.2 * sin(x * 0.0105 / s + t * 1.25)
              + 2.6 * sin(x * 0.0217 / s - t * 1.85 + 1.7)
              + 1.3 * sin(x * 0.047 / s + t * 2.6 + 0.4));
}
`;

export const FULLSCREEN_VS = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* ───────────────────────── 背景（空・水面・水中・深海） ───────────────────────── */

export const WORLD_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uView;          // CSS px
uniform float uScroll;
uniform float uTime;
uniform float uWaterY;       // 水面の平均位置（screen px）
uniform float uWaveScale;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunCol;
uniform vec4 uSun;           // x: 画面上の横位置(0..1) y: 高度(度) z: 強さ w: 月の明るさ
uniform float uLight;        // 水面に届く光の量（0..1）
uniform float uNight;
uniform float uGolden;
uniform float uMoonPhase;
uniform vec2 uPointer;       // screen px
uniform float uPointerOn;
uniform float uHaloY;        // 40m の doc px
uniform sampler2D uSim;
uniform float uSimOn;
uniform vec2 uSimTexel;
${COMMON}

float waterline(float x) {
    float w = uWaterY + waveOffset(x, uTime, uWaveScale);
    return w;
}

// 空の色（sp: screen px, hY: 水平線の screen y）
vec3 skyColor(vec2 sp, float hY) {
    float up = clamp((hY - sp.y) / (uView.y * 0.62), 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.6));

    // 太陽（画面の縦 50° を見ている想定: 1° = H/50 px）
    vec2 sunP = vec2(uSun.x * uView.x, hY - uSun.y * uView.y / 50.0);
    float dd = length(sp - sunP) / uView.y;
    col += uSunCol * (exp(-dd * 7.0) * 0.45 + exp(-dd * 30.0) * 0.55) * uSun.z;
    col += uSunCol * smoothstep(0.024, 0.019, dd) * 1.3 * uSun.z * step(-1.5, uSun.y);

    // 雲（地平線寄りの帯）
    vec2 cp = vec2(sp.x / uView.y, (hY - sp.y) / uView.y);
    float cl = fbm(vec2(cp.x * 1.4 + uTime * 0.006, cp.y * 5.5 + 3.0));
    float band = smoothstep(0.015, 0.1, cp.y) * smoothstep(0.62, 0.22, cp.y);
    float cloud = smoothstep(0.52, 0.78, cl) * band;
    vec3 cloudCol = mix(uHorizon * 1.04 + 0.07, uSunCol * 0.95 + vec3(0.1, 0.02, 0.05), uGolden * 0.75);
    cloudCol = mix(cloudCol, vec3(0.05, 0.07, 0.13), uNight * 0.9);
    col = mix(col, cloudCol, cloud * 0.62);

    // 星と月（夜）
    if (uNight > 0.01) {
        vec2 g = floor(sp / 2.3);
        float s = hash12(g);
        float tw = 0.55 + 0.45 * sin(uTime * 1.7 + s * 60.0);
        col += vec3(0.85, 0.92, 1.0) * step(0.9982, s) * uNight * tw * smoothstep(0.02, 0.2, up);
        vec2 moonP = vec2(uView.x * 0.72, hY - uView.y * 0.4);
        float md = length(sp - moonP) / uView.y;
        // 月齢: 右側から欠ける簡易の影
        float phase = uMoonPhase;
        vec2 q = (sp - moonP) / (uView.y * 0.022);
        float lit = smoothstep(1.0, 0.92, length(q));
        float k = cos(phase * 6.2831853);
        float shadowX = (phase < 0.5 ? -1.0 : 1.0) * k;
        float terminator = smoothstep(-0.05, 0.05, q.x * (phase < 0.5 ? 1.0 : -1.0) - shadowX * sqrt(max(0.0, 1.0 - q.y * q.y)));
        col += vec3(0.95, 0.93, 0.86) * lit * terminator * uNight * 1.1;
        col += vec3(0.5, 0.6, 0.8) * exp(-md * 18.0) * 0.12 * uNight * uSun.w;
    }

    // 富士山（相模湾の向こう。霞んだシルエット）
    // カメラは西南西（255°）を向いている。富士山は方位およそ287°＝画面の右寄り
    float fx = (sp.x - uView.x * 0.86) / uView.y;
    float fujiH = uView.y * 0.052;
    float prof = pow(max(0.0, 1.0 - abs(fx) / 0.3), 1.9);
    float peak = min(prof, 0.9) * fujiH;
    float above = hY - sp.y;
    float px = uView.y / 700.0; // 縁をなめらかにする幅
    float fujiMask = smoothstep(peak + px, peak - px, above) * step(0.0, above);
    if (fujiMask > 0.0) {
        vec3 m = mix(uHorizon * vec3(0.72, 0.78, 0.9), vec3(0.24, 0.3, 0.42), 0.35);
        m = mix(m, uHorizon * 0.55 + vec3(0.08, 0.02, 0.06), uGolden * 0.6);
        m = mix(m, vec3(0.02, 0.035, 0.07), uNight);
        float snow = smoothstep(0.62, 0.7, above / fujiH) * (0.7 + 0.3 * vnoise(vec2(sp.x * 0.08, above * 0.2)));
        m = mix(m, mix(vec3(0.92, 0.95, 1.0), uSunCol, uGolden * 0.5) * (1.0 - uNight * 0.85), snow * 0.8);
        col = mix(col, m, 0.78 * fujiMask);
    }
    // 三浦半島の岬（左手前の低い陸）
    float cx = sp.x / uView.x;
    float capeH = uView.y * (0.016 + 0.01 * fbm(vec2(sp.x / uView.y * 3.0, 1.0))) * pow(smoothstep(0.34, 0.0, cx), 0.7);
    float capeMask = smoothstep(capeH + px, capeH - px, above) * step(0.0, above) * step(0.001, capeH);
    if (capeMask > 0.0) {
        vec3 land = mix(vec3(0.11, 0.18, 0.2), vec3(0.2, 0.13, 0.16), uGolden * 0.5);
        land = mix(land, vec3(0.01, 0.02, 0.04), uNight);
        col = mix(col, land, 0.85 * capeMask);
    }
    return col;
}

// 水面（水平線から手前の水際まで）
vec3 seaSurface(vec2 sp, float hY, float wl) {
    float t = clamp((sp.y - hY) / max(1.0, wl - hY), 0.0, 1.0);
    float z = 1.0 / (t + 0.035);
    vec2 wp = vec2((sp.x - uView.x * 0.5) / uView.y * z * 1.6, z * 1.2);
    float n = fbm(wp * vec2(0.8, 1.6) + vec2(uTime * 0.05, -uTime * 0.18));
    float fres = mix(0.92, 0.3, pow(t, 0.7));
    vec3 refl = mix(uHorizon, uZenith, 0.18 + n * 0.35);
    vec3 body = vec3(0.03, 0.26, 0.34) * (0.25 + uLight * 0.75);
    body = mix(body, vec3(0.01, 0.03, 0.06), uNight * 0.8);
    vec3 col = mix(body, refl, fres);
    // 太陽の下のきらめき
    float sx = (sp.x - uSun.x * uView.x) / uView.y;
    float path = exp(-sx * sx * 9.0 / (0.08 + t * 0.9));
    float glit = pow(vnoise(wp * vec2(3.2, 7.0) + uTime * vec2(0.4, -1.1)), 7.0);
    float glit2 = pow(vnoise(wp * vec2(7.0, 15.0) - uTime * vec2(0.6, 1.6)), 9.0);
    col += uSunCol * (glit * 5.5 + glit2 * 4.0) * path * uSun.z * mix(1.0, 0.5, t);
    col += uSunCol * path * 0.08 * uSun.z * (1.0 - t);
    // 全体に散るきらめき
    col += vec3(1.0) * pow(vnoise(wp * vec2(5.0, 9.0) - uTime * vec2(0.2, 0.9)), 16.0) * (1.0 - uNight) * 0.6 * t;
    // 夜の夜光虫（波が青く光る）
    float noct = pow(vnoise(wp * vec2(4.0, 9.0) + uTime * vec2(0.25, -0.6)), 9.0);
    col += vec3(0.15, 0.75, 1.0) * noct * uNight * 2.2 * (0.2 + t);
    return col;
}

// ドームポートの水滴（水面より上の半分）
vec2 dropNormal(vec2 sp) {
    vec2 g = sp / (uView.y * 0.042);
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float r = hash12(id);
    if (r < 0.84) return vec2(0.0);
    vec2 c = (vec2(hash12(id + 3.1), hash12(id + 7.7)) - 0.5) * 0.35;
    float rad = mix(0.1, 0.3, hash12(id + 1.9));
    vec2 dv = f - c;
    float d = length(dv);
    float m = smoothstep(rad, rad * 0.75, d);
    return (dv / rad) * m;
}

vec3 aboveWater(vec2 sp, float wl) {
    float hY = uWaterY - uView.y * 0.075;
    vec3 col = sp.y < hY ? skyColor(sp, hY) : seaSurface(sp, hY, wl);
    // 水平線をなめらかにつなぐ
    float hb = smoothstep(hY - 1.5, hY + 1.5, sp.y);
    if (abs(sp.y - hY) < 2.0) col = mix(skyColor(vec2(sp.x, hY - 2.0), hY), seaSurface(vec2(sp.x, hY + 2.0), hY, wl), hb);
    return col;
}

vec3 underwater(vec2 sp, float wl, float d, float docY) {
    vec3 K = vec3(0.36, 0.07, 0.035);
    vec3 E = exp(-K * max(d, 0.0));
    // 水の散乱光（赤から先に消える）
    vec3 scatter = vec3(0.32, 0.8, 0.96);
    vec3 col = uLight * E * scatter * 0.62;
    col += vec3(0.003, 0.01, 0.022);
    // 夜の浅場: 月明かりのかすかな青
    col += vec3(0.004, 0.02, 0.04) * uNight * exp(-max(d, 0.0) / 30.0);

    float below = sp.y - wl;
    // 水面の裏側（全反射で明るく揺れる天井）
    if (below > 0.0) {
        float band = exp(-below / (uView.y * 0.07));
        float rip = fbm(vec2(sp.x / uView.y * 5.0 + uTime * 0.05, below / uView.y * 14.0 - uTime * 0.35));
        col += band * (0.08 + uLight * 0.9) * vec3(0.45, 0.82, 0.95) * (0.28 + 0.9 * rip * rip);
        col += band * uNight * vec3(0.1, 0.55, 0.9) * pow(rip, 4.0) * 0.8;
    }

    // 光の筋（ゴッドレイ）
    float rayFade = exp(-max(d, 0.0) / 20.0) * uLight;
    if (rayFade > 0.003) {
        // ハロクラインの揺らぎで光の筋も曲がる
        float hd = (docY - uHaloY) / (uView.y * 0.22);
        float hm = exp(-hd * hd);
        vec2 q = sp + vec2(sin(docY * 0.03 + uTime * 0.8) * 26.0 * hm, 0.0);
        vec2 O = vec2(uView.x * (0.5 + (uSun.x - 0.5) * 0.3), min(wl, 0.0) - uView.y * 0.6);
        vec2 v = q - O;
        float ang = atan(v.x, v.y);
        float r1 = vnoise(vec2(ang * 34.0, uTime * 0.11));
        float r2 = vnoise(vec2(ang * 83.0 + 3.0, uTime * 0.19));
        float rays = smoothstep(0.5, 0.95, r1 * 0.62 + r2 * 0.48);
        float fall = exp(-max(0.0, sp.y - max(wl, 0.0)) / (uView.y * 1.1));
        col += vec3(0.5, 0.85, 0.92) * rays * fall * rayFade * 0.42;
    }

    // 浅い所のコースティクス（上側だけ淡く）
    float caus = pow(abs(sin(fbm(sp / uView.y * 7.0 + vec2(uTime * 0.07, uTime * 0.05)) * 9.0)), 6.0);
    col += vec3(0.4, 0.8, 0.85) * caus * exp(-max(d, 0.0) / 9.0) * uLight * 0.07 * (1.0 - smoothstep(0.0, uView.y, sp.y - max(wl, 0.0)));

    // ハロクライン（40m）: 二つの水がまざる揺らぎ。境目はゆらめく光の膜になる
    float hdPx = docY - uHaloY;
    float wob = (fbm(vec2(sp.x / uView.y * 2.2 + uTime * 0.07, uTime * 0.05)) - 0.5) * uView.y * 0.09
              + sin(sp.x / uView.x * 6.2831853 * 1.5 + uTime * 0.6) * uView.y * 0.012;
    float hd2 = (hdPx - wob) / (uView.y * 0.2);
    float hmask = exp(-hd2 * hd2);
    if (hmask > 0.002) {
        float w = fbm(vec2(sp.x / uView.y * 3.0 + uTime * 0.05, docY / uView.y * 5.0 - uTime * 0.03));
        vec3 irid = 0.5 + 0.5 * cos(6.2831853 * (vec3(0.0, 0.33, 0.67) + sp.x / uView.x * 0.7 + w * 1.4 + uTime * 0.04));
        float sheet = smoothstep(0.3, 0.85, w) * hmask;
        col += irid * sheet * 0.16 + vec3(0.08, 0.26, 0.36) * hmask * 0.12;
        // 境目そのものの細い光
        float edge = exp(-abs(hdPx - wob) / (2.2 + 10.0 * (1.0 - w)));
        col += mix(vec3(0.5, 0.95, 1.0), vec3(0.8, 0.65, 1.0), w) * edge * 0.55;
        col += vec3(0.3, 0.7, 0.9) * exp(-abs(hdPx - wob) / 40.0) * 0.06;
    }

    // 深海: かすかな明暗と、ライト（カーソル）
    float deep = smoothstep(30.0, 70.0, d);
    col += vec3(0.004, 0.012, 0.03) * fbm(sp / uView.y * 2.0 + uTime * 0.01) * deep;
    if (uPointerOn > 0.0) {
        float pd = length(sp - uPointer) / uView.y;
        float lamp = exp(-pd * pd * 22.0);
        col += vec3(0.05, 0.13, 0.18) * lamp * deep * uPointerOn;
        col += vec3(0.02, 0.05, 0.06) * exp(-pd * pd * 180.0) * deep * uPointerOn;
    }
    return col;
}

void main() {
    vec2 sp = vec2(vUv.x * uView.x, (1.0 - vUv.y) * uView.y);
    float docY = uScroll + sp.y;

    vec4 sim = vec4(0.0);
    if (uSimOn > 0.5) sim = texture(uSim, vUv);

    float wlBase = waterline(sp.x);
    float wl = wlBase + sim.r * 9.0 * uWaveScale;
    float d = depthAt(docY);

    vec3 col;
    if (sp.y < wl) {
        col = aboveWater(sp, wl);
    } else {
        col = underwater(sp, wl, d, docY);

        // カーソルが残した発光（深い所ほど見える）
        float deep = smoothstep(25.0, 55.0, d);
        col += vec3(0.12, 0.7, 1.0) * sim.b * 0.1 * deep;
    }

    // 画面の四隅を少し落とす
    vec2 c = vUv - 0.5;
    col *= 1.0 - dot(c, c) * 0.42;

    fragColor = vec4(max(col, 0.0), 1.0);
}
`;

/* ───────────────────────── 水面の縁と、沈んだ見出し（画面解像度で重ねる） ───────────────────────── */

export const SURFACE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uView;
uniform float uScroll;
uniform float uTime;
uniform float uWaterY;
uniform float uWaveScale;
uniform float uLight;
uniform sampler2D uSim;
uniform float uSimOn;
uniform sampler2D uText;
uniform vec4 uTextRect;      // doc px (x, y, w, h)
uniform float uTextOn;
${COMMON}

void main() {
    vec2 sp = vec2(vUv.x * uView.x, (1.0 - vUv.y) * uView.y);
    vec4 sim = vec4(0.0);
    if (uSimOn > 0.5) sim = texture(uSim, vUv);
    float wlBase = uWaterY + waveOffset(sp.x, uTime, uWaveScale);
    float wl = wlBase + sim.r * 9.0 * uWaveScale;
    float m = sp.y - wl;

    vec3 col = vec3(0.0);
    float a = 0.0;

    // 水面の縁（メニスカス）: 暗い帯と、細い光の線
    float dark = 0.3 * exp(-abs(m + 3.0) / 3.0);
    float line = exp(-abs(m - 1.2) / 1.0) * 0.55 * (0.35 + uLight);

    // 沈んだ見出し
    if (uTextOn > 0.5 && sp.y > wlBase) {
        float below = sp.y - wlBase;
        float docY = uScroll + sp.y;
        vec2 off = vec2(
            sin(docY * 0.045 + uTime * 2.1) * 3.2 + sin(sp.x * 0.021 + uTime * 1.3) * 1.4,
            sin(sp.x * 0.032 - uTime * 1.7) * 2.2) * uWaveScale;
        off += vec2(sim.g, sim.r) * 18.0;
        vec2 tp = vec2(sp.x, uScroll + wlBase + below / 1.07) + off;
        vec2 tuv = (tp - uTextRect.xy) / uTextRect.zw;
        if (tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) {
            vec2 ca = vec2(1.1 / uTextRect.z, 0.0);
            float ar = texture(uText, tuv + ca).a;
            float ag = texture(uText, tuv).a;
            float ab = texture(uText, tuv - ca).a;
            float ta = max(max(ar, ag), ab) * 0.9 * exp(-below / (uView.y * 0.8));
            vec3 tint = vec3(0.74, 0.95, 1.0) * (0.62 + uLight * 0.45);
            vec3 tc = mix(vec3(ag), vec3(ar, ag, ab), 0.55) * tint;
            col = tc;
            a = ta;
        }
    }

    // 合成: 光の線は足し、暗い帯は下地を暗くする（アルファで表現）
    vec3 outC = col * a + vec3(0.85, 0.96, 1.0) * line;
    float outA = clamp(a + dark, 0.0, 1.0);
    fragColor = vec4(outC, outA);
}
`;

/* ───────────────────────── 波とゆらめきの計算（ping-pong） ───────────────────────── */

export const SIM_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform float uShift;        // スクロールで流れた分（テクスチャ座標）
uniform vec2 uP0;            // 前フレームのカーソル（0..1、y上向き）
uniform vec2 uP1;            // 今のカーソル
uniform float uPStrength;
uniform float uPRadius;
uniform vec4 uPulse;         // x,y,強さ,半径
uniform float uWaves;        // 1: 波動方程式を解く / 0: 発光だけ
uniform float uAspect;
uniform float uGlowFloor;    // 8bit で計算するときに、薄い発光がいつまでも残らないようにする

vec4 S(vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
    return texture(uPrev, uv);
}

float capsule(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    // GL の向き（y 上向き）のまま計算する。カーソル座標も JS 側で上向きに直して渡す
    vec2 uv = vUv;
    vec2 src = uv - vec2(0.0, uShift);
    vec4 c = S(src);
    float h = c.r;
    float hp = c.g;
    float glow = c.b;

    float hn = h;
    if (uWaves > 0.5) {
        float lap = S(src + vec2(uTexel.x, 0.0)).r + S(src - vec2(uTexel.x, 0.0)).r
                  + S(src + vec2(0.0, uTexel.y)).r + S(src - vec2(0.0, uTexel.y)).r - 4.0 * h;
        hn = (2.0 * h - hp + 0.42 * lap) * 0.984;
    }
    // 発光は少し広がりながら消えていく
    float g4 = S(src + vec2(uTexel.x, 0.0)).b + S(src - vec2(uTexel.x, 0.0)).b
             + S(src + vec2(0.0, uTexel.y)).b + S(src - vec2(0.0, uTexel.y)).b;
    glow = max(mix(glow, g4 * 0.25, 0.1) * 0.95 - uGlowFloor, 0.0);

    // カーソルの通り道
    vec2 asp = vec2(uAspect, 1.0);
    float dist = capsule(uv * asp, uP0 * asp, uP1 * asp);
    float stamp = exp(-(dist * dist) / (uPRadius * uPRadius));
    hn -= stamp * uPStrength * 0.35;
    glow += stamp * uPStrength * 0.3;

    // クリック（ソナーの一打）
    if (uPulse.z > 0.0) {
        float pd = length((uv - uPulse.xy) * asp);
        float ps = exp(-(pd * pd) / (uPulse.w * uPulse.w));
        hn -= ps * uPulse.z;
        glow += ps * uPulse.z * 0.3;
    }
    // 波の山谷そのものも光らせる（リングが広がりながら光る）
    glow += abs(hn - h) * 0.25 * uWaves;

    fragColor = vec4(clamp(hn, -2.0, 2.0), h, clamp(glow, 0.0, 1.2), 1.0);
}
`;

/* ───────────────────────── 背景の拡大合成 ───────────────────────── */

export const BLIT_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTex;
uniform float uTime;
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
void main() {
    vec3 c = texture(uTex, vUv).rgb;
    // バンディング対策のディザ（画面の解像度でかける）
    c += (hash12(gl_FragCoord.xy + fract(uTime * 7.0) * 61.0) - 0.5) / 255.0;
    fragColor = vec4(c, 1.0);
}
`;

/* ───────────────────────── マリンスノー / 言葉のプランクトン ───────────────────────── */

export const PARTICLE_VS = /* glsl */ `#version 300 es
precision highp float;
in vec4 aSeed;
in float aGlyph;
uniform vec2 uView;
uniform float uScroll;
uniform float uTime;
uniform float uDpr;
uniform float uWaterY;
uniform sampler2D uSim;
uniform float uSimOn;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uLight;
uniform float uNight;
out float vAlpha;
out float vKind;       // 0: 雪, 1: 言葉
out vec3 vColor;
out float vGlyph;
out float vFlash;
${COMMON}

void main() {
    float layer = aSeed.z;
    float par = mix(0.32, 1.05, layer);
    float span = uView.y * 1.5;
    float drift = uTime * (4.0 + 10.0 * aSeed.w);
    float y = mod(aSeed.y * span - uScroll * par - drift, span) - uView.y * 0.25;
    float x = aSeed.x * uView.x + sin(uTime * 0.13 + aSeed.w * 40.0) * 22.0 * layer;
    float docY = uScroll + y;
    float d = depthAt(docY);

    // 40m の膜を境に、雪が言葉に変わる（境目は一粒ずつ少しずらす）
    float word = smoothstep(39.4, 40.6, d + (aSeed.w - 0.5) * 1.6);
    float light = exp(-0.05 * d) * uLight;
    float snow = (1.0 - word) * smoothstep(0.6, 4.0, d) * (0.2 + 0.8 * clamp(light * 1.6, 0.0, 1.0));

    vec4 sim = vec4(0.0);
    vec2 suv = vec2(x / uView.x, y / uView.y);
    if (uSimOn > 0.5 && suv.x >= 0.0 && suv.x <= 1.0 && suv.y >= 0.0 && suv.y <= 1.0) {
        sim = textureLod(uSim, vec2(suv.x, 1.0 - suv.y), 0.0);
        x += sim.g * 40.0 * layer;
    }
    // 近づくとカーソルのライトで照らされる
    float pd = uPointerOn > 0.0 ? length(vec2(x, y) - uPointer) / uView.y : 9.0;
    float lamp = exp(-pd * pd * 70.0) * uPointerOn;

    // ときどき勝手に光る（生物発光のまたたき）
    float blink = pow(max(0.0, sin(uTime * (0.35 + aSeed.w * 0.5) + aSeed.x * 91.0)), 60.0);
    float flash = clamp(sim.b * 1.1 + lamp * 0.7 + blink * 0.5, 0.0, 1.3);

    // 水面より上には出さない
    float aboveCut = step(uWaterY + 6.0, y);

    float isWord = step(0.5, word);
    vKind = isWord;
    vGlyph = aGlyph;
    vFlash = flash;
    if (isWord > 0.5) {
        float base = 0.022 + 0.05 * layer;
        vAlpha = (base + flash * 0.85) * word * aboveCut;
        float hue = aSeed.w;
        vColor = hue < 0.72 ? vec3(0.45, 0.95, 1.0) : (hue < 0.9 ? vec3(0.66, 0.6, 1.0) : vec3(1.0, 0.55, 0.85));
        gl_PointSize = (9.0 + 11.0 * layer) * (1.0 + flash * 0.25) * uDpr;
    } else {
        vAlpha = snow * (0.25 + 0.6 * layer) * aboveCut + lamp * 0.3 * (1.0 - word);
        vColor = mix(vec3(0.75, 0.9, 0.95), vec3(1.0, 0.97, 0.9), light) * (0.4 + light * 0.9);
        gl_PointSize = (1.2 + 2.8 * layer) * uDpr;
        // 夜の海では、浅い所のプランクトンが触れると青く光る（夜光虫）
        if (uNight > 0.01) {
            float glowA = (0.04 + flash * 0.9) * uNight * (1.0 - word) * smoothstep(0.3, 2.0, d) * aboveCut;
            vColor = mix(vColor, vec3(0.35, 0.9, 1.0) * 1.6, uNight);
            vAlpha = max(vAlpha, glowA);
            gl_PointSize *= 1.0 + uNight * (0.6 + flash * 0.8);
        }
    }
    vec2 ndc = vec2(x / uView.x * 2.0 - 1.0, 1.0 - y / uView.y * 2.0);
    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

export const PARTICLE_FS = /* glsl */ `#version 300 es
precision highp float;
in float vAlpha;
in float vKind;
in vec3 vColor;
in float vGlyph;
in float vFlash;
out vec4 fragColor;
uniform sampler2D uAtlas;
uniform float uAtlasGrid;

void main() {
    if (vAlpha < 0.004) discard;
    vec2 pc = gl_PointCoord;
    float r = length(pc - 0.5) * 2.0;
    if (vKind < 0.5) {
        float a = smoothstep(1.0, 0.1, r);
        fragColor = vec4(vColor * a * vAlpha, 0.0);
        return;
    }
    float cell = floor(vGlyph + 0.5);
    vec2 cxy = vec2(mod(cell, uAtlasGrid), floor(cell / uAtlasGrid));
    vec2 uv = (cxy + pc) / uAtlasGrid;
    float g = texture(uAtlas, uv).a;
    float halo = exp(-r * r * 5.0) * (0.04 + vFlash * 0.2);
    float a = (g + halo) * vAlpha;
    fragColor = vec4(vColor * a, 0.0);
}
`;

/* ───────────────────────── 魚群 ───────────────────────── */

export const FISH_VS = /* glsl */ `#version 300 es
precision highp float;
in vec3 aLocal;       // x,y: 魚の形 / z: 尾かどうか
in vec4 aSeed;        // インスタンスごと
uniform vec2 uView;
uniform float uScroll;
uniform float uTime;
uniform vec2 uCenter; // 群れの中心（x: screen px, y: doc px）
uniform float uRadius;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uDpr;
uniform float uLight;
out vec3 vColor;
out float vAlpha;
${COMMON}

vec2 fishPos(float t) {
    float speed = 0.28 + aSeed.w * 0.12;
    float phi = aSeed.x * 6.2831853 + t * speed;
    float r = uRadius * (0.45 + 0.55 * aSeed.y);
    vec2 c = uCenter + vec2(sin(t * 0.06) * uView.x * 0.18, sin(t * 0.09 + 1.3) * uView.y * 0.06);
    return c + vec2(cos(phi) * r * 1.7, sin(phi) * r * 0.32 + (aSeed.z - 0.5) * uRadius * 0.55);
}

void main() {
    vec2 p = fishPos(uTime);
    vec2 p2 = fishPos(uTime + 0.05);
    vec2 dir = normalize(p2 - p + 1e-4);
    float phi = aSeed.x * 6.2831853 + uTime * (0.28 + aSeed.w * 0.12);
    float nearness = 0.55 + 0.45 * sin(phi); // 奥↔手前

    vec2 sp = vec2(p.x, p.y - uScroll);
    // カーソルを避ける
    if (uPointerOn > 0.0) {
        vec2 away = sp - uPointer;
        float dd = length(away);
        float push = uView.y * 0.16;
        sp += normalize(away + 1e-3) * push * exp(-(dd * dd) / (push * push * 0.9)) * uPointerOn;
    }

    float len = (7.0 + 9.0 * nearness) * (0.85 + aSeed.y * 0.3);
    vec2 lp = aLocal.xy;
    // 尾びれを振る
    float wig = sin(uTime * 13.0 + aSeed.x * 40.0) * 0.45 * aLocal.z;
    lp = vec2(lp.x, lp.y + wig * (-lp.x) * 0.9);
    vec2 side = vec2(-dir.y, dir.x);
    vec2 world = sp + (dir * lp.x + side * lp.y) * len;

    float d = depthAt(p.y);
    vec3 K = vec3(0.36, 0.07, 0.035);
    vec3 E = exp(-K * d) * (0.2 + uLight * 0.9);
    float glint = pow(abs(sin(phi * 2.0 + aSeed.w * 6.0)), 18.0);
    float belly = clamp(0.5 - aLocal.y * 2.2, 0.0, 1.0);
    vec3 silver = mix(vec3(0.46, 0.62, 0.72), vec3(0.92, 0.97, 1.0), belly) * (0.55 + 0.45 * nearness);
    vec3 Es = mix(E, vec3(dot(E, vec3(0.33))), 0.45);
    vColor = silver * Es * 1.35 + vec3(0.95, 1.0, 1.0) * glint * Es * 1.6;
    vAlpha = (0.55 + 0.4 * nearness) * smoothstep(0.0, 3.0, d) * (1.0 - smoothstep(36.0, 44.0, d));

    vec2 ndc = vec2(world.x / uView.x * 2.0 - 1.0, 1.0 - world.y / uView.y * 2.0);
    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

export const FISH_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 fragColor;
void main() {
    fragColor = vec4(vColor * vAlpha, vAlpha);
}
`;

/* ───────────────────────── 泡（浮きながら大きくなる：ボイルの法則） ───────────────────────── */

export const BUBBLE_VS = /* glsl */ `#version 300 es
precision highp float;
in vec4 aBubble;   // x, y (screen px), 半径 px, alpha
uniform vec2 uView;
uniform float uDpr;
out float vAlpha;
void main() {
    vAlpha = aBubble.w;
    gl_PointSize = aBubble.z * 2.0 * uDpr;
    vec2 ndc = vec2(aBubble.x / uView.x * 2.0 - 1.0, 1.0 - aBubble.y / uView.y * 2.0);
    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

export const BUBBLE_FS = /* glsl */ `#version 300 es
precision highp float;
in float vAlpha;
out vec4 fragColor;
void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float rim = smoothstep(0.62, 0.98, r) * smoothstep(1.0, 0.94, r);
    float spec = exp(-dot(p - vec2(-0.35, -0.38), p - vec2(-0.35, -0.38)) * 28.0);
    float body = 0.06;
    float a = (rim * 0.75 + spec * 0.9 + body) * vAlpha;
    vec3 c = vec3(0.85, 0.97, 1.0);
    fragColor = vec4(c * a, a * 0.6);
}
`;

/* ───────────────────────── 言葉のクラゲ ───────────────────────── */

export const JELLY_VS = /* glsl */ `#version 300 es
precision highp float;
in vec4 aP;       // x: 種類(0=傘 1=触手 2=口腕) y,z: パラメータ w: 乱数
in float aGlyph;  // 触手の文字（-1 は点）
uniform vec2 uView;
uniform float uTime;
uniform float uDpr;
uniform vec3 uJelly;    // screen x, screen y, 大きさ(px)
uniform float uPhase;
uniform vec3 uTint;
uniform float uFlash;
uniform float uMaxPoint;
out float vAlpha;
out float vKind;
out vec3 vColor;
out float vGlyph;

void main() {
    float t = uTime * 0.9 + uPhase;
    float pulse = 0.5 + 0.5 * sin(t * 1.6);           // 傘の拍動
    float contract = pow(pulse, 2.2);
    float R = uJelly.z;
    float kind = aP.x;
    vec3 pos;
    float bright;
    vGlyph = aGlyph;
    vKind = aGlyph >= 0.0 ? 1.0 : 0.0;

    if (kind > 2.5) {
        // 傘の内側の光（大きなぼかしの点を一つ）
        vKind = 2.0;
        vAlpha = (0.16 + 0.1 * pulse) * (0.8 + uFlash);
        vColor = mix(uTint, vec3(1.0), 0.2);
        gl_PointSize = min(R * 2.6 * uDpr, uMaxPoint);
        vec2 c = uJelly.xy + vec2(0.0, -R * 0.12);
        gl_Position = vec4(c.x / uView.x * 2.0 - 1.0, 1.0 - c.y / uView.y * 2.0, 0.0, 1.0);
        return;
    }

    if (kind < 0.5) {
        float th = aP.y;
        float ph = aP.z;                                // 0..1（頂点→縁）
        float rim = 1.0 - 0.18 * contract * ph * ph;
        float rr = R * sin(ph * 1.45) * rim * (1.0 + 0.04 * sin(th * 8.0 + t));
        pos = vec3(cos(th) * rr, -cos(ph * 1.45) * R * 0.98 + R * 0.12 + contract * R * 0.06 * ph, sin(th) * rr);
        float canal = pow(abs(cos(th * 2.0)), 24.0);
        bright = 0.2 + 1.1 * pow(ph, 4.0) + canal * 0.55;
    } else {
        float th = aP.y;
        float s = aP.z;                                  // 0..1（根元→先）
        float rimR = R * sin(1.45) * (1.0 - 0.18 * contract);
        float L = kind < 1.5 ? R * (2.4 + aP.w * 1.4) : R * 1.1;
        float r0 = kind < 1.5 ? rimR * 0.92 : rimR * 0.25;
        float sway = sin(s * 5.0 - t * 1.8 + th * 3.0) * R * 0.28 * s;
        float sway2 = cos(s * 3.5 - t * 1.2 + th * 2.0) * R * 0.2 * s;
        pos = vec3(cos(th) * r0 + sway, R * (kind < 1.5 ? 0.12 : 0.05) + s * L, sin(th) * r0 + sway2);
        // 光が根元から先へ流れる
        bright = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(s * 9.0 - t * 3.2 + th), 3.0);
    }

    // ゆっくり傾ける
    float ang = sin(t * 0.21) * 0.25;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    pos.xy = rot * pos.xy;
    float persp = 1.0 / (1.0 + pos.z / (R * 6.0));
    vec2 sp = uJelly.xy + pos.xy * persp;

    vAlpha = bright * (0.45 + 0.55 * persp) * (0.8 + uFlash);
    vColor = mix(uTint, vec3(0.85, 1.0, 1.0), 0.25 * pulse);
    if (vKind > 0.5) {
        vAlpha *= 1.5;
        gl_PointSize = (9.0 + 4.0 * persp) * uDpr * (R / 110.0 + 0.45);
    } else {
        gl_PointSize = (kind < 0.5 ? 2.2 : 1.8) * persp * uDpr * (R / 90.0 + 0.5);
    }
    vec2 ndc = vec2(sp.x / uView.x * 2.0 - 1.0, 1.0 - sp.y / uView.y * 2.0);
    gl_Position = vec4(ndc, 0.0, 1.0);
}
`;

export const JELLY_FS = /* glsl */ `#version 300 es
precision highp float;
in float vAlpha;
in float vKind;
in vec3 vColor;
in float vGlyph;
out vec4 fragColor;
uniform sampler2D uAtlas;
uniform float uAtlasGrid;
void main() {
    vec2 pc = gl_PointCoord;
    float r = length(pc - 0.5) * 2.0;
    float a;
    if (vKind > 1.5) {
        a = exp(-r * r * 3.2) * vAlpha;
        fragColor = vec4(vColor * a, 0.0);
        return;
    }
    if (vKind > 0.5) {
        float cell = floor(vGlyph + 0.5);
        vec2 cxy = vec2(mod(cell, uAtlasGrid), floor(cell / uAtlasGrid));
        float g = texture(uAtlas, (cxy + pc) / uAtlasGrid).a;
        a = (g + exp(-r * r * 4.0) * 0.18) * vAlpha;
    } else {
        a = smoothstep(1.0, 0.0, r) * vAlpha;
    }
    fragColor = vec4(vColor * a, 0.0);
}
`;

/** JS 側の水面の波形（GLSL の waveOffset と同じ） */
export function waveOffset(x: number, t: number, s: number) {
    return (
        s *
        (4.2 * Math.sin((x * 0.0105) / s + t * 1.25) +
            2.6 * Math.sin((x * 0.0217) / s - t * 1.85 + 1.7) +
            1.3 * Math.sin((x * 0.047) / s + t * 2.6 + 0.4))
    );
}
