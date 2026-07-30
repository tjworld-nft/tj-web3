"use client";

import { useEffect, useRef, useState } from "react";
import type { OceanSceneHandle } from "./ocean/oceanScene";

/**
 * ページ全体の背後に敷く WebGPU レイヤー。
 * three.js は動的 import なので初期バンドルには入らない。
 * WebGPU/WebGL2 のどちらも使えない環境では CSS グラデーションだけが残る。
 */
export default function OceanBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let handle: OceanSceneHandle | null = null;
        let cancelled = false;

        const start = async () => {
            try {
                const reducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;
                const forceWebGL = new URLSearchParams(
                    window.location.search
                ).has("forcewebgl");

                const { createOceanScene } = await import("./ocean/oceanScene");
                const scene = await createOceanScene({
                    canvas,
                    reducedMotion,
                    forceWebGL,
                });

                if (cancelled) {
                    scene.dispose();
                    return;
                }

                handle = scene;
                setReady(true);
                window.dispatchEvent(
                    new CustomEvent("ocean:ready", {
                        detail: {
                            backend: scene.backend,
                            particleCount: scene.particleCount,
                        },
                    })
                );
            } catch (error) {
                console.warn(
                    "[ocean] GPU シーンを初期化できませんでした。CSS の背景で表示します。",
                    error
                );
            }
        };

        // レイアウトが確定してから（=キャンバスに実寸が付いてから）立ち上げる。
        // 非表示タブで初期化すると 0px 扱いになり品質判定を誤るため。
        let idleId: number | null = null;
        let timeoutId: number | null = null;
        let observer: ResizeObserver | null = null;
        let booted = false;

        const boot = () => {
            if (cancelled || booted) return;
            booted = true;
            observer?.disconnect();
            observer = null;
            if (typeof window.requestIdleCallback === "function") {
                idleId = window.requestIdleCallback(() => void start(), {
                    timeout: 600,
                });
            } else {
                timeoutId = window.setTimeout(() => void start(), 80);
            }
        };

        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
            boot();
        } else if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => {
                if (canvas.clientWidth > 0 && canvas.clientHeight > 0) boot();
            });
            observer.observe(canvas);
            // 何らかの理由で実寸が付かない場合の保険
            timeoutId = window.setTimeout(boot, 2500);
        } else {
            boot();
        }

        return () => {
            cancelled = true;
            observer?.disconnect();
            if (idleId !== null && typeof window.cancelIdleCallback === "function") {
                window.cancelIdleCallback(idleId);
            }
            if (timeoutId !== null) window.clearTimeout(timeoutId);
            handle?.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            {/* GPU が使えなくても成立する下地 */}
            <div className="absolute inset-0 bg-abyss-gradient" />
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ease-out ${ready ? "opacity-100" : "opacity-0"
                    }`}
            />
            {/* 粒状ノイズで階調のバンディングを潰す */}
            <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-overlay" />
        </div>
    );
}
