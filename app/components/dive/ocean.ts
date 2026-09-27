/**
 * 海の物理。HUD（ダイブコンピューター）と背景の色は、ここにある値だけで動く。
 *
 * - 海面水温: 気象庁「沿岸域の海面水温情報」相模湾（海域306）日別平年値 1991–2020
 *   https://www.data.jma.go.jp/kaiyou/data/db/kaikyo/series/engan/engan306.html
 *   （相模湾の海域平均。城ヶ島・宮川湾の実測ではない）
 * - 深い所の水温はモデル値（表層の混合層 → 水温躍層 → 1000mで約4℃）
 * - NDL: PADI RDP（メートル版）の減圧不要限界。演出用の表示で、ダイビング計画には使わない
 * - 光の減衰: 水は赤→橙→黄→緑の順に光を吸う。Beer–Lambert の係数（沿岸の海の目安）
 */

/** 1/1 から 12/31 まで（2/29 を含む366日）の平年値。単位は 0.1℃ */
const SAGAMI_SST_NORMAL_TENTHS = [
    172, 171, 171, 170, 170, 169, 168, 168, 167, 166, 166, 165, 164, 164, 163, 163, 162, 162, 162, 161, 161, 161, 160, 160,
    160, 159, 159, 158, 158, 157, 157, 157, 156, 156, 156, 155, 155, 155, 154, 154, 154, 154, 154, 154, 154, 153, 153, 153,
    153, 153, 153, 153, 153, 153, 153, 153, 153, 153, 153, 153, 154, 154, 154, 154, 154, 155, 155, 155, 155, 156, 156, 156,
    156, 156, 157, 157, 157, 158, 158, 158, 158, 159, 159, 159, 160, 160, 160, 161, 161, 162, 162, 162, 163, 163, 164, 164,
    164, 165, 166, 166, 166, 167, 168, 168, 169, 169, 170, 170, 171, 172, 172, 173, 174, 174, 175, 176, 176, 177, 178, 178,
    179, 180, 181, 182, 182, 183, 184, 185, 186, 186, 187, 188, 189, 190, 191, 192, 192, 193, 194, 195, 196, 197, 198, 199,
    200, 201, 201, 202, 203, 204, 204, 205, 206, 206, 207, 208, 209, 209, 210, 211, 212, 212, 213, 214, 215, 216, 217, 218,
    218, 219, 220, 221, 222, 222, 223, 224, 225, 226, 227, 228, 229, 230, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239,
    240, 241, 242, 243, 244, 244, 246, 246, 248, 248, 250, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 261,
    262, 263, 263, 264, 264, 265, 265, 265, 265, 266, 266, 266, 266, 266, 266, 266, 266, 266, 266, 266, 266, 266, 265, 265,
    265, 264, 264, 264, 263, 263, 263, 262, 262, 261, 261, 261, 260, 260, 259, 258, 258, 257, 257, 256, 255, 254, 254, 253,
    252, 251, 250, 249, 248, 248, 247, 246, 245, 244, 243, 242, 242, 241, 240, 239, 238, 237, 237, 236, 235, 234, 233, 233,
    232, 231, 230, 230, 229, 228, 227, 226, 225, 225, 224, 223, 222, 221, 221, 220, 219, 218, 218, 217, 216, 216, 215, 214,
    214, 213, 212, 211, 211, 210, 209, 208, 208, 207, 206, 205, 204, 204, 203, 202, 202, 201, 200, 199, 199, 198, 197, 196,
    195, 195, 194, 193, 192, 192, 191, 190, 189, 188, 187, 186, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 177, 176,
    175, 175, 174, 174, 173, 173,];

const MONTH_START_LEAP = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

/** 今日（日本時間）の相模湾の海面水温・平年値 */
export function seaSurfaceNormal(date = new Date()): number {
    const jst = new Date(date.getTime() + 9 * 3600 * 1000);
    const idx = MONTH_START_LEAP[jst.getUTCMonth()] + jst.getUTCDate() - 1;
    return SAGAMI_SST_NORMAL_TENTHS[Math.min(365, Math.max(0, idx))] / 10;
}

/** 水深 d(m) の水温のモデル。表層15mまでは混合層、その下は1000mで約4℃へ */
export function waterTemperature(depth: number, surface: number): number {
    const d = Math.max(0, depth);
    const deep = 3.6;
    const below = Math.max(0, d - 15);
    return deep + (surface - deep) * Math.exp(-below / 240);
}

/** PADI RDP（メートル版）の減圧不要限界（分） */
const NDL_TABLE: [number, number][] = [
    [10, 219], [12, 147], [14, 98], [16, 72], [18, 56], [20, 45],
    [22, 37], [25, 29], [30, 20], [35, 14], [40, 9], [42, 8],
];

export function noDecoLimit(depth: number): number | null {
    if (depth > 42) return null;
    if (depth <= 10) return 219;
    for (let i = 1; i < NDL_TABLE.length; i++) {
        const [d1, n1] = NDL_TABLE[i];
        if (depth <= d1) {
            // 表は深い側の値を使う（切り上げ）のが RDP の読み方
            return n1;
        }
    }
    return null;
}

/** 絶対圧（気圧）。10mごとに1気圧ずつ増える */
export function pressureAta(depth: number): number {
    return 1 + Math.max(0, depth) / 10;
}

/** 水が光を吸う係数（1/m）。赤が最初に消える */
export const EXTINCTION = { r: 0.36, g: 0.07, b: 0.035 } as const;

/** 水深 d で残っている光の割合（RGB） */
export function lightRemaining(depth: number) {
    const d = Math.max(0, depth);
    return {
        r: Math.exp(-EXTINCTION.r * d),
        g: Math.exp(-EXTINCTION.g * d),
        b: Math.exp(-EXTINCTION.b * d),
    };
}

export type Zone = { id: string; ja: string; en: string };

export function zoneOf(depth: number): Zone {
    if (depth < 0.5) return { id: "surface", ja: "水面", en: "SURFACE" };
    if (depth < 18) return { id: "sunlit", ja: "光の届く海", en: "SUNLIT" };
    if (depth < 40) return { id: "deep", ja: "ディープダイビング", en: "DEEP" };
    if (depth < 200) return { id: "words", ja: "言葉の海", en: "EPIPELAGIC · AI" };
    if (depth < 1000) return { id: "twilight", ja: "薄明の言葉", en: "MESOPELAGIC · AI" };
    return { id: "midnight", ja: "最深部", en: "BATHYPELAGIC · AI" };
}

/** レクリエーショナルダイビングの限界水深 */
export const RECREATIONAL_LIMIT = 40;
/** オープンウォーター・ダイバーの最大水深 */
export const OPEN_WATER_LIMIT = 18;
