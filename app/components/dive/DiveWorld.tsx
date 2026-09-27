"use client";

import { useEffect, useRef } from "react";
import { dive } from "./diveState";
import type { DiveEngine } from "./engine";
import type { TimeMode } from "./sky";

/**
 * ページの背後の海。入力（スクロール・カーソル・クリック）を集めてダイブの状態を更新し、
 * WebGL2 のエンジンを立ち上げる。GPU が使えない環境では CSS の海だけが残る。
 */

const FALLBACK_STOPS: [number, [number, number, number]][] = [
    [0, [26, 132, 164]],
    [8, [12, 96, 124]],
    [25, [7, 58, 82]],
    [45, [4, 30, 46]],
    [200, [2, 14, 24]],
    [1000, [1, 5, 10]],
];

function fallbackColor(depth: number) {
    let i = 0;
    while (i < FALLBACK_STOPS.length - 2 && depth > FALLBACK_STOPS[i + 1][0]) i++;
    const [d0, c0] = FALLBACK_STOPS[i];
    const [d1, c1] = FALLBACK_STOPS[i + 1];
    const t = Math.min(1, Math.max(0, (depth - d0) / (d1 - d0)));
    return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(",")})`;
}

export default function DiveWorld() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fallbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const fallback = fallbackRef.current;
        if (!canvas || !fallback) return;

        const html = document.documentElement;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        dive.reducedMotion = reduced.matches;

        const params = new URLSearchParams(window.location.search);
        // OGP画像を撮るとき用: 計器やバーを消す
        if (params.has("og")) html.dataset.og = "1";
        const t = params.get("time");
        if (t === "day" || t === "golden" || t === "night" || t === "live") {
            dive.timeMode = t as TimeMode;
        }

        /* ── 測る ── */
        let measureQueued = false;
        const measure = () => {
            if (measureQueued) return;
            measureQueued = true;
            requestAnimationFrame(() => {
                measureQueued = false;
                dive.measure();
                dive.scrollY = window.scrollY;
            });
        };
        dive.measure();
        dive.scrollY = window.scrollY;

        // CSS の海の水面を、見出しの三行目にそろえる（GPU の海に切り替わるときに跳ねないように）
        const waterEl = document.querySelector<HTMLElement>("[data-waterline]");
        if (waterEl) {
            const r = waterEl.getBoundingClientRect();
            fallback.style.setProperty("--fb-water", `${Math.round(r.top + window.scrollY + r.height * 0.56)}px`);
        }

        const ro = new ResizeObserver(measure);
        ro.observe(document.body);
        window.addEventListener("resize", measure);

        /* ── 入力 ── */
        const onScroll = () => {
            dive.scrollY = window.scrollY;
        };
        let touchTimer = 0;
        const releaseTouchSoon = (ms: number) => {
            window.clearTimeout(touchTimer);
            touchTimer = window.setTimeout(() => {
                dive.pointerActive = false;
            }, ms);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (dive.pointerActive && dive.cameraDepth > 40) {
                dive.lightPath += Math.min(200, Math.hypot(e.clientX - dive.pointerX, e.clientY - dive.pointerY));
            }
            dive.pointerX = e.clientX;
            dive.pointerY = e.clientY;
            dive.pointerActive = true;
            if (e.pointerType === "touch") releaseTouchSoon(900);
        };
        const onPointerDown = (e: PointerEvent) => {
            dive.pointerX = e.clientX;
            dive.pointerY = e.clientY;
            dive.pointerActive = true;
            if (e.pointerType === "touch") releaseTouchSoon(900);
        };
        const onPointerUp = (e: PointerEvent) => {
            if (e.pointerType === "touch") releaseTouchSoon(600);
        };
        // 波紋（ソナー）はクリック/タップのときだけ。スクロールのためのタッチでは出さない
        const onClick = (e: MouseEvent) => {
            if (dive.pulses.length < 4) {
                dive.pulses.push({ x: e.clientX, y: e.clientY, t: performance.now(), strength: 0.9 });
            }
        };
        const onLeave = (e: MouseEvent) => {
            if (!e.relatedTarget) dive.pointerActive = false;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("pointerup", onPointerUp, { passive: true });
        window.addEventListener("pointercancel", onPointerUp, { passive: true });
        window.addEventListener("click", onClick, { passive: true });
        document.addEventListener("mouseout", onLeave);

        /* ── カードのスポットライトと本の傾き（まとめて1つのハンドラで） ── */
        const onHover = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const el = e.target as HTMLElement | null;
            const log = el?.closest?.<HTMLElement>(".log");
            if (log) {
                const r = log.getBoundingClientRect();
                log.style.setProperty("--mx", `${e.clientX - r.left}px`);
                log.style.setProperty("--my", `${e.clientY - r.top}px`);
            }
            const book = el?.closest?.<HTMLElement>(".book");
            if (book) {
                const r = book.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                book.style.setProperty("--ry", `${(x * 18).toFixed(2)}deg`);
                book.style.setProperty("--rx", `${(-y * 14).toFixed(2)}deg`);
            }
        };
        const onBookLeave = (e: PointerEvent) => {
            const book = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(".book");
            if (book && !book.contains(e.relatedTarget as Node)) {
                book.style.setProperty("--ry", "0deg");
                book.style.setProperty("--rx", "0deg");
            }
        };
        document.addEventListener("pointermove", onHover, { passive: true });
        document.addEventListener("pointerout", onBookLeave, { passive: true });

        /* ── スクロールで浮かび上がる ── */
        const io = new IntersectionObserver(
            (entries) => {
                for (const en of entries) {
                    if (en.isIntersecting) {
                        en.target.classList.add("is-in");
                        io.unobserve(en.target);
                    }
                }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        document.querySelectorAll(".rv, [data-watch]").forEach((el) => io.observe(el));
        // 保険: 監視が効かなくても 2.5 秒後には全部見せる
        const revealAll = window.setTimeout(() => {
            document.querySelectorAll(".rv:not(.is-in), [data-watch]:not(.is-in)").forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
            });
        }, 2500);

        /* ── 毎フレーム: 状態を配る ── */
        let raf = 0;
        let lastY = window.scrollY;
        let lastT = performance.now();
        let lastFallback = "";
        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const dt = Math.max(0.001, (now - lastT) / 1000);
            dive.scrollVel = dive.scrollVel * 0.8 + ((dive.scrollY - lastY) / dt) * 0.2;
            lastY = dive.scrollY;
            lastT = now;
            const depth = dive.cameraDepth;
            if (depth > dive.maxDepth) dive.maxDepth = depth;
            // 0.4秒ごとに水深を記録（ダイブログの折れ線）
            const elapsed = (now - dive.startedAt) / 1000;
            const lastSample = dive.profile[dive.profile.length - 1];
            if (!lastSample || elapsed - lastSample.t >= 0.4) {
                dive.profile.push({ t: elapsed, d: depth });
                if (dive.profile.length > 1200) dive.profile = dive.profile.filter((_, i) => i % 2 === 0);
            }
            const c = fallbackColor(depth);
            if (c !== lastFallback) {
                lastFallback = c;
                fallback.style.backgroundColor = c;
                const skyOn = Math.max(0, 1 - dive.scrollY / (dive.viewH * 0.6));
                fallback.style.setProperty("--fb-sky", skyOn.toFixed(3));
                fallback.style.setProperty("--fb-rays", Math.max(0, 1 - depth / 40).toFixed(3));
            }
            dive.emit();
        };
        raf = requestAnimationFrame(tick);

        /* ── エンジン ── */
        let engine: DiveEngine | null = null;
        let cancelled = false;
        let refreshTimer = 0;
        let booting = false;
        const headline = document.querySelector<HTMLElement>("[data-headline]");

        const boot = async () => {
            // 開発時の StrictMode では effect が二度走る。片付け済みの回では立ち上げない
            if (cancelled || booting || engine) return;
            booting = true;
            try {
                const lowPower = (navigator.hardwareConcurrency ?? 8) <= 2;
                const { createDiveEngine } = await import("./engine");
                // 見出しを水面で切るのは、GPU の海がフェードインし終わってから（文字が一瞬欠けないように）
                let readyAt = Infinity;
                let pending: string | null = null;
                let pendingTimer = 0;
                const applyClip = (poly: string | null) => {
                    if (!headline) return;
                    headline.style.clipPath = poly ?? "";
                    headline.style.setProperty("-webkit-clip-path", poly ?? "");
                };
                const e = await createDiveEngine({
                    canvas,
                    reducedMotion: dive.reducedMotion || lowPower,
                    headline,
                    clipHeadline: (poly) => {
                        if (poly === null) {
                            pending = null;
                            window.clearTimeout(pendingTimer);
                            pendingTimer = 0;
                            applyClip(null);
                            return;
                        }
                        if (performance.now() - readyAt > 900) {
                            applyClip(poly);
                            return;
                        }
                        pending = poly;
                        if (!pendingTimer) {
                            pendingTimer = window.setTimeout(() => {
                                pendingTimer = 0;
                                if (!cancelled && pending) applyClip(pending);
                            }, 950);
                        }
                    },
                });
                readyAt = performance.now();
                if (cancelled) {
                    e.dispose();
                    return;
                }
                engine = e;
                dive.gpu = "webgl2";
                canvas.classList.add("is-ready");
                html.classList.add("gpu");
                (window as unknown as { __diveEngine: DiveEngine }).__diveEngine = e;
                document.fonts?.ready.then(() => {
                    if (!cancelled) engine?.refreshHeadline();
                });
                refreshTimer = window.setTimeout(() => engine?.refreshHeadline(), 1800);
            } catch (err) {
                console.warn("[dive] GPUの海を立ち上げられませんでした。CSSの海で表示します。", err);
            } finally {
                booting = false;
            }
        };

        const onLost = () => {
            engine?.dispose();
            engine = null;
            dive.gpu = "none";
            canvas.classList.remove("is-ready");
            html.classList.remove("gpu");
        };
        // iOS などで裏に回したときに GPU を取り上げられても、戻ってきたら作り直す
        const onRestored = () => {
            if (!cancelled) void boot();
        };
        canvas.addEventListener("dive:lost", onLost);
        canvas.addEventListener("webglcontextrestored", onRestored);

        // ページの読み込みが終わって手が空いてから、GPU の海を立ち上げる（最初の表示を邪魔しない）
        let idleHandle = 0;
        let idleTimer = 0;
        const idle = (cb: () => void) => {
            const w = window as Window & { requestIdleCallback?: Window["requestIdleCallback"] };
            if (typeof w.requestIdleCallback === "function") idleHandle = w.requestIdleCallback(cb, { timeout: 1200 });
            else idleTimer = window.setTimeout(cb, 120);
        };
        const startWhenLoaded = () => idle(() => void boot());
        if (document.readyState === "complete") startWhenLoaded();
        else window.addEventListener("load", startWhenLoaded, { once: true });

        document.fonts?.ready.then(() => {
            dive.measure();
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.clearTimeout(revealAll);
            window.clearTimeout(touchTimer);
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
            window.removeEventListener("click", onClick);
            document.removeEventListener("mouseout", onLeave);
            document.removeEventListener("pointermove", onHover);
            document.removeEventListener("pointerout", onBookLeave);
            canvas.removeEventListener("dive:lost", onLost);
            canvas.removeEventListener("webglcontextrestored", onRestored);
            window.removeEventListener("load", startWhenLoaded);
            window.clearTimeout(refreshTimer);
            if (idleHandle && "cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
            window.clearTimeout(idleTimer);
            engine?.dispose();
            engine = null;
        };
    }, []);

    return (
        <div className="sea-layer" aria-hidden="true">
            <div className="sea-fallback" ref={fallbackRef} />
            <canvas className="sea-canvas" ref={canvasRef} />
            <div className="sea-grain" />
        </div>
    );
}
