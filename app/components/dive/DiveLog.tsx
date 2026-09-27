"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dive } from "./diveState";
import { formatDepth } from "./nav";
import { RECREATIONAL_LIMIT } from "./ocean";
import { skyForMode } from "./sky";

/**
 * あなたのダイブログ。このページで潜った軌跡（スクロールの水深の記録）を、
 * ダイブコンピューターのログのような1枚の画像にする。保存・シェアできる。
 */

const W = 1200;
const H = 630;

/** 角丸の四角（古い Safari には ctx.roundRect がない） */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawLog(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = 2;
    canvas.width = W * scale;
    canvas.height = H * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const root = getComputedStyle(document.documentElement);
    const mincho = root.getPropertyValue("--font-mincho").trim() || "serif";
    const mono = root.getPropertyValue("--font-mono").trim() || "monospace";

    // 背景: 水面の青から深海の黒へ
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f6f8e");
    bg.addColorStop(0.28, "#07384f");
    bg.addColorStop(0.62, "#031623");
    bg.addColorStop(1, "#01060c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // マリンスノーと言葉のプランクトン
    const rnd = (() => {
        let a = 1997;
        return () => ((a = (a * 16807) % 2147483647) / 2147483647);
    })();
    for (let i = 0; i < 260; i++) {
        const y = rnd() * H;
        const deep = y / H;
        ctx.fillStyle = deep < 0.45 ? `rgba(220,245,255,${0.15 + rnd() * 0.3})` : `rgba(127,245,255,${0.08 + rnd() * 0.35})`;
        const r = deep < 0.45 ? 0.6 + rnd() * 1.4 : 0.6 + rnd() * 1.1;
        ctx.beginPath();
        ctx.arc(rnd() * W, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const sky = skyForMode(dive.timeMode);
    const now = new Date(Date.now() + 9 * 3600 * 1000);
    const date = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, "0")}.${String(now.getUTCDate()).padStart(2, "0")} ${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} JST`;

    // 見出し
    ctx.fillStyle = "#7ff5ff";
    ctx.font = `700 18px ${mono}`;
    ctx.fillText("DIVE LOG", 64, 76);
    ctx.fillStyle = "rgba(230,248,255,0.7)";
    ctx.font = `500 14px ${mono}`;
    ctx.fillText("www.tj-web3.com", 64 + ctx.measureText("DIVE LOG   ").width + 40, 76);
    ctx.fillStyle = "#f4fbff";
    ctx.font = `800 44px ${mincho}`;
    ctx.fillText("海にも、AIにも、深く潜った。", 62, 134);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(230,248,255,0.85)";
    ctx.font = `500 15px ${mono}`;
    ctx.fillText(date, W - 64, 76);
    ctx.fillText(`MIURA · ${sky.periodJa}`, W - 64, 100);
    ctx.textAlign = "left";

    // 潜水の軌跡（水深は平方根の目盛り: 浅い所の動きも見えるように）
    const gx0 = 64;
    const gx1 = W - 64;
    const gy0 = 186;
    const gy1 = 452;
    const samples = dive.profile.length > 1 ? dive.profile : [{ t: 0, d: 0 }, { t: 1, d: dive.cameraDepth }];
    const tMax = Math.max(1, samples[samples.length - 1].t);
    const dMax = Math.max(50, dive.maxDepth * 1.05);
    const X = (t: number) => gx0 + (t / tMax) * (gx1 - gx0);
    const Y = (d: number) => gy0 + Math.sqrt(Math.max(0, d) / dMax) * (gy1 - gy0);

    ctx.strokeStyle = "rgba(180,228,255,0.14)";
    ctx.lineWidth = 1;
    for (const d of [0, 5, 18, 40, 200, 1000]) {
        if (d > dMax) continue;
        ctx.beginPath();
        ctx.moveTo(gx0, Y(d));
        ctx.lineTo(gx1, Y(d));
        ctx.stroke();
        ctx.fillStyle = "rgba(200,232,250,0.55)";
        ctx.font = `500 11px ${mono}`;
        ctx.fillText(d === 0 ? "SURFACE" : `${d}m`, gx0 + 4, Y(d) - 5);
    }
    // 40m（レクリエーショナルの限界）
    if (dMax > RECREATIONAL_LIMIT) {
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(255,154,130,0.8)";
        ctx.beginPath();
        ctx.moveTo(gx0, Y(RECREATIONAL_LIMIT));
        ctx.lineTo(gx1, Y(RECREATIONAL_LIMIT));
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "rgba(255,170,150,0.95)";
        ctx.font = `700 11px ${mono}`;
        ctx.textAlign = "right";
        ctx.fillText("40m LIMIT → THE SEA OF WORDS (AI)", gx1 - 4, Y(RECREATIONAL_LIMIT) - 6);
        ctx.textAlign = "left";
    }
    // 面
    const area = ctx.createLinearGradient(0, gy0, 0, gy1);
    area.addColorStop(0, "rgba(127,245,255,0.22)");
    area.addColorStop(1, "rgba(127,245,255,0)");
    ctx.beginPath();
    ctx.moveTo(X(samples[0].t), Y(0));
    for (const s of samples) ctx.lineTo(X(s.t), Y(s.d));
    ctx.lineTo(X(samples[samples.length - 1].t), Y(0));
    ctx.closePath();
    ctx.fillStyle = area;
    ctx.fill();
    // 線
    const line = ctx.createLinearGradient(gx0, 0, gx1, 0);
    line.addColorStop(0, "#ffffff");
    line.addColorStop(0.5, "#7ff5ff");
    line.addColorStop(1, "#b6a2ff");
    ctx.beginPath();
    samples.forEach((s, i) => (i === 0 ? ctx.moveTo(X(s.t), Y(s.d)) : ctx.lineTo(X(s.t), Y(s.d))));
    ctx.strokeStyle = line;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(127,245,255,0.6)";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 最大水深の点
    let maxS = samples[0];
    for (const s of samples) if (s.d > maxS.d) maxS = s;
    ctx.fillStyle = "#7ff5ff";
    ctx.beginPath();
    ctx.arc(X(maxS.t), Y(maxS.d), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `700 13px ${mono}`;
    ctx.fillStyle = "#e9fdff";
    const lbl = `MAX ${formatDepth(maxS.d)}m`;
    const lx = Math.min(gx1 - ctx.measureText(lbl).width, X(maxS.t) + 12);
    ctx.fillText(lbl, lx, Math.min(gy1 - 4, Y(maxS.d) + 22));

    // 数字
    const elapsed = Math.floor((performance.now() - dive.startedAt) / 1000);
    const words = Math.round(dive.lightPath / 28);
    const stats: [string, string][] = [
        ["MAX DEPTH", `${formatDepth(dive.maxDepth)}m`],
        ["DIVE TIME", `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`],
        ["光らせた言葉", words > 0 ? `約${words.toLocaleString("en-US")}` : "—"],
        ["SAFETY STOP", dive.safetyStopDone ? "DONE ✓" : "—"],
    ];
    const bx0 = 64;
    const bw = (W - 128 - 3 * 14) / 4;
    stats.forEach(([k, v], i) => {
        const x = bx0 + i * (bw + 14);
        const y = 482;
        ctx.fillStyle = "rgba(3,20,32,0.72)";
        ctx.strokeStyle = "rgba(180,228,255,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRect(ctx, x, y, bw, 84, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(200,232,250,0.6)";
        ctx.font = /[぀-ヿ一-鿿]/.test(k) ? `700 12px ${mincho}` : `500 11px ${mono}`;
        ctx.fillText(k, x + 18, y + 28);
        ctx.fillStyle = "#f4fbff";
        ctx.font = /[぀-ヿ一-鿿]/.test(v) ? `800 28px ${mincho}` : `700 30px ${mono}`;
        ctx.fillText(v, x + 18, y + 66);
    });

    ctx.fillStyle = "rgba(220,242,255,0.6)";
    ctx.font = `500 12px ${mono}`;
    ctx.textAlign = "right";
    ctx.fillText("Logged on TJ's dive computer — PADI Course Director × AI Creator", W - 64, H - 26);
    ctx.textAlign = "left";
}

export default function DiveLog() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canShareFile, setCanShareFile] = useState(false);

    const open = useCallback(async () => {
        const d = dialogRef.current;
        const c = canvasRef.current;
        if (!d || !c) return;
        try {
            const root = getComputedStyle(document.documentElement);
            await Promise.all([
                document.fonts.load(`800 44px ${root.getPropertyValue("--font-mincho")}`, "海にも、AIにも、深く潜った。光らせた言葉約"),
                document.fonts.load(`700 18px ${root.getPropertyValue("--font-mono")}`, "DIVE LOG"),
            ]);
        } catch {
            /* 代替フォントで描く */
        }
        try {
            drawLog(c);
        } catch (err) {
            console.warn("[dive] ダイブログを描けませんでした", err);
        }
        if (!d.open) d.showModal();
        try {
            const probe = new File([new Blob(["x"], { type: "image/png" })], "x.png", { type: "image/png" });
            setCanShareFile(!!navigator.canShare?.({ files: [probe] }));
        } catch {
            setCanShareFile(false);
        }
    }, []);

    useEffect(() => {
        const onOpen = () => void open();
        window.addEventListener("dive:open-log", onOpen);
        return () => window.removeEventListener("dive:open-log", onOpen);
    }, [open]);

    const blob = () =>
        new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob((b) => resolve(b), "image/png"));

    const save = async () => {
        const b = await blob();
        if (!b) return;
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tj-dive-log-${Date.now()}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    const text = () =>
        `TJのサイトで、水深${formatDepth(dive.maxDepth)}mまで潜ってきた。40mを越えると、そこは言葉の海。 #海にもAIにも深く潜る`;

    const share = async () => {
        const b = await blob();
        if (!b) return;
        const file = new File([b], "tj-dive-log.png", { type: "image/png" });
        try {
            await navigator.share({ files: [file], text: text(), url: "https://www.tj-web3.com/" });
        } catch {
            /* キャンセル */
        }
    };

    const xUrl = () =>
        `https://x.com/intent/post?text=${encodeURIComponent(text())}&url=${encodeURIComponent("https://www.tj-web3.com/")}`;

    return (
        <>
            <button type="button" className="btn btn--ghost divelog-open" onClick={() => void open()}>
                あなたのダイブログを見る <span className="btn__arrow">→</span>
            </button>
            <dialog ref={dialogRef} className="divelog" aria-labelledby="divelog-title" onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}>
                <div className="divelog__inner">
                    <div className="divelog__head">
                        <h3 id="divelog-title">あなたのダイブログ</h3>
                        <button type="button" className="chip" onClick={() => dialogRef.current?.close()}>
                            CLOSE
                        </button>
                    </div>
                    <canvas ref={canvasRef} className="divelog__canvas" role="img" aria-label="このページで潜った水深の記録（グラフと数字）" />
                    <p className="divelog__note">このページをスクロールした軌跡が、そのまま潜水の記録になっています。</p>
                    <div className="btn-row" style={{ marginTop: 16 }}>
                        <button type="button" className="btn btn--light" onClick={() => void save()}>
                            画像を保存
                        </button>
                        {canShareFile && (
                            <button type="button" className="btn btn--ghost" onClick={() => void share()}>
                                シェアする
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => window.open(xUrl(), "_blank", "noopener,noreferrer")}
                        >
                            X にポスト
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
