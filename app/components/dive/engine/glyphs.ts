/**
 * 「言葉のプランクトン」と「言葉のクラゲ」の文字を1枚のテクスチャ（アトラス）に焼く。
 * 漢字・かなは明朝、英字と記号は等幅で描く。
 */

export const ATLAS_GRID = 10;
const CELL = 64;

/** 深海を漂う一文字たち（海の字と、つくる字と、コードの記号） */
export const PLANKTON_CHARS = [
    "海", "光", "潜", "泡", "波", "魚", "月", "創", "言", "夢", "学", "声", "歌", "潮", "青", "心",
    "水", "星", "詩", "絵", "音", "問", "答", "旅",
    "う", "み", "ひ", "か", "り", "こ", "と", "ば",
    "{", "}", "<", ">", "/", "=", ";", "λ", "Δ", "✦", "∞", "#", "*", "+",
];

/** クラゲの触手に並べる言葉（上から下へ一文字ずつ） */
export const TENTACLE_WORDS = [
    "CLAUDE", "CODEX", "WEBGL", "GLSL", "SUNO", "SWIFT", "FLUTTER", "PROMPT",
    "OCEAN", "DIVE", "TOKEN", "LIGHT", "REMOTION", "VIBE",
];

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export type GlyphAtlas = {
    canvas: HTMLCanvasElement;
    grid: number;
    index: Map<string, number>;
    plankton: number[];
};

function isLatinish(ch: string) {
    return /^[\x20-\x7e]$/.test(ch) || "λΔ✦∞".includes(ch);
}

export async function buildGlyphAtlas(): Promise<GlyphAtlas> {
    const root = getComputedStyle(document.documentElement);
    const mincho = root.getPropertyValue("--font-mincho").trim() || "serif";
    const mono = root.getPropertyValue("--font-mono").trim() || "monospace";

    const chars: string[] = [];
    for (const c of PLANKTON_CHARS) if (!chars.includes(c)) chars.push(c);
    for (const c of LATIN) if (!chars.includes(c)) chars.push(c);
    const glyphs = chars.slice(0, ATLAS_GRID * ATLAS_GRID);

    const jp = glyphs.filter((c) => !isLatinish(c)).join("");
    const lat = glyphs.filter((c) => isLatinish(c)).join("");
    try {
        await Promise.all([
            document.fonts.load(`700 ${CELL}px ${mincho}`, jp),
            document.fonts.load(`500 ${CELL}px ${mono}`, lat),
        ]);
    } catch {
        // 読めなければ代替フォントで描く
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = ATLAS_GRID * CELL;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("[dive] 2d context unavailable");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const index = new Map<string, number>();
    glyphs.forEach((ch, i) => {
        const cx = (i % ATLAS_GRID) * CELL + CELL / 2;
        const cy = Math.floor(i / ATLAS_GRID) * CELL + CELL / 2;
        const latin = isLatinish(ch);
        ctx.font = latin
            ? `500 ${Math.round(CELL * 0.56)}px ${mono}`
            : `700 ${Math.round(CELL * 0.62)}px ${mincho}`;
        ctx.fillText(ch, cx, cy + (latin ? 1 : 2));
        index.set(ch, i);
    });

    const plankton = PLANKTON_CHARS.map((c) => index.get(c)).filter(
        (v): v is number => v !== undefined
    );
    return { canvas, grid: ATLAS_GRID, index, plankton };
}
