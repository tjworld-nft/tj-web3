"use client";

import { useEffect, useRef, useState } from "react";
import { dive } from "./diveState";
import { formatDepth } from "./nav";

/**
 * 「浮上する」。ダイビングの浮上と同じ手順で水面へ戻る:
 *   ゆっくり上がる → 水深5mで安全停止（本当は3分。ここでは3秒）→ 水面へ。
 * 途中でスクロールやキー操作をしたら、その場で中断する。
 */

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Ascend() {
    const [phase, setPhase] = useState<"idle" | "up" | "stop" | "last" | "done">("idle");
    const [count, setCount] = useState(3);
    const [summary, setSummary] = useState({ max: "0", time: "0:00" });
    const abort = useRef<() => void>(() => {});

    useEffect(() => () => abort.current(), []);

    const start = () => {
        if (phase !== "idle" && phase !== "done") return;
        const maxDepth = dive.maxDepth;
        const elapsed = Math.floor((performance.now() - dive.startedAt) / 1000);
        setSummary({
            max: formatDepth(maxDepth),
            time: `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`,
        });

        if (dive.reducedMotion) {
            window.scrollTo({ top: 0, behavior: "auto" });
            setPhase("done");
            window.setTimeout(() => setPhase("idle"), 3600);
            return;
        }

        let raf = 0;
        let timer = 0;
        let cancelled = false;
        const cancel = () => {
            if (cancelled) return;
            cancelled = true;
            cancelAnimationFrame(raf);
            window.clearInterval(timer);
            dive.ascending = false;
            dive.safetyStopRemaining = 0;
            window.removeEventListener("wheel", cancel);
            window.removeEventListener("touchstart", cancel);
            window.removeEventListener("keydown", cancel);
            setPhase("idle");
        };
        abort.current = cancel;
        // ボタンを押した操作そのものでは中断しないよう、少し待ってから監視する
        window.setTimeout(() => {
            if (cancelled) return;
            window.addEventListener("wheel", cancel, { passive: true });
            window.addEventListener("touchstart", cancel, { passive: true });
            window.addEventListener("keydown", cancel);
        }, 200);

        const glide = (to: number, ms: number, done: () => void) => {
            const from = window.scrollY;
            const t0 = performance.now();
            const step = (now: number) => {
                if (cancelled) return;
                const k = Math.min(1, (now - t0) / ms);
                window.scrollTo({ top: from + (to - from) * easeInOut(k), behavior: "instant" as ScrollBehavior });
                if (k < 1) raf = requestAnimationFrame(step);
                else done();
            };
            raf = requestAnimationFrame(step);
        };

        dive.ascending = true;
        setPhase("up");
        const stopY = dive.scrollYForDepth(5);
        const dist = window.scrollY - stopY;
        glide(stopY, Math.min(5200, Math.max(2200, dist * 0.45)), () => {
            setPhase("stop");
            let left = 3;
            dive.safetyStopRemaining = left;
            setCount(left);
            timer = window.setInterval(() => {
                left -= 1;
                dive.safetyStopRemaining = Math.max(0, left);
                setCount(Math.max(0, left));
                if (left <= 0) {
                    window.clearInterval(timer);
                    dive.safetyStopDone = true;
                    setPhase("last");
                    glide(0, 1600, () => {
                        dive.ascending = false;
                        window.removeEventListener("wheel", cancel);
                        window.removeEventListener("touchstart", cancel);
                        window.removeEventListener("keydown", cancel);
                        setPhase("done");
                        window.setTimeout(() => setPhase((p) => (p === "done" ? "idle" : p)), 7000);
                    });
                }
            }, 1000);
        });
    };

    const on = phase !== "idle";

    return (
        <>
            <div className="ascend">
                <button type="button" className="ascend__btn" onClick={start}>
                    <i aria-hidden="true">↑</i>
                    浮上する
                </button>
                <p className="ascend__sub">安全停止をしてから、水面へ戻ります。</p>
            </div>
            <div className={`stop-overlay ${on ? "is-on" : ""}`} role="status" aria-live="polite">
                {on && (
                    <div className="stop-overlay__box">
                        {phase === "up" && (
                            <>
                                <div className="stop-overlay__label">ASCENDING</div>
                                <div className="stop-overlay__big">↑</div>
                                <div className="stop-overlay__sub">ゆっくり浮上しています</div>
                            </>
                        )}
                        {phase === "stop" && (
                            <>
                                <div className="stop-overlay__label">SAFETY STOP · 5m</div>
                                <div className="stop-overlay__big">0:0{count}</div>
                                <div className="stop-overlay__sub">安全停止（本当は3分。今回は3秒）</div>
                            </>
                        )}
                        {phase === "last" && (
                            <>
                                <div className="stop-overlay__label">SURFACING</div>
                                <div className="stop-overlay__big">↑</div>
                            </>
                        )}
                        {phase === "done" && (
                            <>
                                <div className="stop-overlay__label">WELCOME BACK</div>
                                <div className="stop-overlay__big">{summary.max}m</div>
                                <div className="stop-overlay__sub">
                                    最大水深 {summary.max}m ・ 潜水時間 {summary.time}。おかえりなさい。
                                </div>
                                <button
                                    type="button"
                                    className="stop-overlay__btn"
                                    onClick={() => window.dispatchEvent(new CustomEvent("dive:open-log"))}
                                >
                                    ダイブログを見る →
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
