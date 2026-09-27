/** ページの区切り（右端の目盛り・モバイルのメニュー・HUD の案内で共用） */
export const DIVE_STOPS = [
    { id: "surface", label: "水面", en: "Surface", depth: 0 },
    { id: "profile", label: "潜る人", en: "Profile", depth: 5 },
    { id: "marine", label: "三浦の海", en: "Miura", depth: 12 },
    { id: "limit", label: "40m", en: "Limit", depth: 40, limit: true },
    { id: "words", label: "言葉の海", en: "AI", depth: 48 },
    { id: "library", label: "深海の書庫", en: "Books", depth: 420 },
    { id: "abyss", label: "最深部", en: "Contact", depth: 800 },
] as const;

export function formatDepth(d: number) {
    if (d < 100) return d.toFixed(1);
    return Math.round(d).toLocaleString("en-US");
}
