/**
 * ヒーローの見出しを、画面に出ているのと同じ位置・同じ書体でキャンバスに描き写す。
 * 水面より上は HTML の文字（くっきり）、水面より下はこの写しを GPU が屈折させて描く。
 */

export type HeadlineTexture = {
    canvas: HTMLCanvasElement;
    /** ドキュメント座標での矩形（CSS px） */
    rect: { x: number; y: number; w: number; h: number };
};

const PAD = 24;

export function drawHeadline(el: HTMLElement): HeadlineTexture | null {
    const box = el.getBoundingClientRect();
    if (box.width < 4 || box.height < 4) return null;
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const w = box.width + PAD * 2;
    const h = box.height + PAD * 2;

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(w * scale);
    canvas.height = Math.ceil(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.scale(scale, scale);
    ctx.textBaseline = "alphabetic";

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node: Node | null;
    while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest(".sr-only")) continue;
        const style = getComputedStyle(parent);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ctx.font = font;
        let color = style.color;
        if (color === "rgba(0, 0, 0, 0)" || color === "transparent") color = "#e9fbff";
        ctx.fillStyle = color;

        const text = node.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (ch.trim() === "") continue;
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const r = range.getClientRects()[0];
            if (!r) continue;
            const m = ctx.measureText(ch);
            const asc = m.fontBoundingBoxAscent || parseFloat(style.fontSize) * 0.88;
            const desc = m.fontBoundingBoxDescent || parseFloat(style.fontSize) * 0.12;
            const x = r.left - box.left + PAD + (r.width - m.width) / 2;
            const y = r.top - box.top + PAD + (r.height - (asc + desc)) / 2 + asc;
            ctx.fillText(ch, x, y);
        }
    }
    range.detach?.();

    return {
        canvas,
        rect: {
            x: box.left - PAD,
            y: box.top + window.scrollY - PAD,
            w,
            h,
        },
    };
}
