"use client";

import { useEffect, useRef } from "react";
import { lightRemaining } from "../dive/ocean";

/**
 * 水深18mの写真。水は赤から先に光を吸うので、深いと赤い魚も灰緑色に見える。
 * カーソル（指）をライトにして当てた所だけ、本当の色が戻る。
 */
export default function Torch({
    src,
    alt,
    depth = 18,
}: {
    src: string;
    alt: string;
    depth?: number;
}) {
    const ref = useRef<HTMLElement>(null);
    const L = lightRemaining(depth);
    const pct = (v: number) => (v < 0.01 ? (v * 100).toFixed(2) : (v * 100).toFixed(0));

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let r = 0;
        let target = 0;
        let x = 0.5;
        let y = 0.5;
        let tx = 0.5;
        let ty = 0.5;
        let raf = 0;
        let auto = 0;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const coarse = window.matchMedia("(pointer: coarse)").matches;

        let running = false;
        const loop = () => {
            if (!running) return;
            raf = requestAnimationFrame(loop);
            if (auto) {
                // 指の端末では、ライトがゆっくり写真の上を泳ぐ
                const t = performance.now() / 1000;
                tx = 0.5 + Math.sin(t * 0.55) * 0.3;
                ty = 0.45 + Math.sin(t * 0.83 + 1) * 0.22;
            }
            r += (target - r) * 0.12;
            x += (tx - x) * 0.18;
            y += (ty - y) * 0.18;
            const w = el.clientWidth;
            el.style.setProperty("--r", `${r.toFixed(1)}px`);
            el.style.setProperty("--x", `${(x * 100).toFixed(2)}%`);
            el.style.setProperty("--y", `${(y * 100).toFixed(2)}%`);
            el.classList.toggle("is-lit", r > w * 0.05);
        };
        // 画面に入っている間だけ動かす
        const vis = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !running) {
                running = true;
                raf = requestAnimationFrame(loop);
            } else if (!e.isIntersecting) {
                running = false;
                cancelAnimationFrame(raf);
            }
        });
        vis.observe(el);

        const size = () => Math.max(110, Math.min(220, el.clientWidth * 0.24));
        const onMove = (e: PointerEvent) => {
            const b = el.getBoundingClientRect();
            tx = (e.clientX - b.left) / b.width;
            ty = (e.clientY - b.top) / b.height;
            if (e.pointerType !== "touch") {
                auto = 0;
                target = size();
            }
        };
        const onEnter = (e: PointerEvent) => {
            if (e.pointerType !== "touch") target = size();
        };
        const onLeave = (e: PointerEvent) => {
            if (e.pointerType !== "touch" && !auto) target = 0;
        };
        const onDown = (e: PointerEvent) => {
            onMove(e);
            auto = 0;
            target = size();
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("pointerdown", onDown);

        let io: IntersectionObserver | null = null;
        if (coarse || reduced) {
            io = new IntersectionObserver(
                ([e]) => {
                    if (e.isIntersecting) {
                        auto = reduced ? 0 : 1;
                        target = size();
                    } else if (auto) {
                        target = 0;
                    }
                },
                { threshold: 0.5 }
            );
            io.observe(el);
        }

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            vis.disconnect();
            io?.disconnect();
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerenter", onEnter);
            el.removeEventListener("pointerleave", onLeave);
            el.removeEventListener("pointerdown", onDown);
        };
    }, []);

    return (
        <figure className="torch" ref={ref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="torch__deep" src={src} alt={alt} loading="lazy" decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="torch__lit" src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <span className="torch__beam" aria-hidden="true" />
            <span className="torch__hint" aria-hidden="true">
                LIGHT ON — ライトを当ててみてください
            </span>
            <figcaption className="torch__hud">
                <span>DEPTH {depth}m</span>
                <span className="torch__rgb" aria-label="この水深に届く光の割合">
                    <span style={{ "--c": "#ff6b6b" } as React.CSSProperties}>赤 {pct(L.r)}%</span>
                    <span style={{ "--c": "#6bffb0" } as React.CSSProperties}>緑 {pct(L.g)}%</span>
                    <span style={{ "--c": "#6bc8ff" } as React.CSSProperties}>青 {pct(L.b)}%</span>
                </span>
            </figcaption>
            {/* 水深18mの見え方（赤がほぼ届かない）を再現するフィルター */}
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
                <filter id="depth-18m" colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="0.06 0.05 0.02 0 0.01
                                0.02 0.62 0.14 0 0.07
                                0.02 0.18 0.72 0 0.12
                                0    0    0    1 0"
                    />
                </filter>
            </svg>
        </figure>
    );
}
