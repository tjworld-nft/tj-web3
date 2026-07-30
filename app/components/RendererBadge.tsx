"use client";

import { useEffect, useState } from "react";

type OceanReadyDetail = {
    backend: "webgpu" | "webgl2";
    particleCount: number;
};

/**
 * 背景がどの API で描かれているかを控えめに示すバッジ。
 * GPU シーンが立ち上がらなかった環境では何も出さない。
 */
export default function RendererBadge() {
    const [detail, setDetail] = useState<OceanReadyDetail | null>(null);
    const [inHero, setInHero] = useState(true);

    useEffect(() => {
        const onReady = (event: Event) => {
            setDetail((event as CustomEvent<OceanReadyDetail>).detail);
        };
        const onScroll = () => {
            setInHero(window.scrollY < window.innerHeight * 0.7);
        };
        window.addEventListener("ocean:ready", onReady);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener("ocean:ready", onReady);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    if (!detail) return null;

    return (
        <div
            className={`pointer-events-none fixed right-4 bottom-4 z-30 hidden transition-opacity duration-500 lg:block ${inHero ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-[0.6rem] tracking-[0.16em] text-text-tertiary">
                <span
                    className={`h-1.5 w-1.5 rounded-full ${detail.backend === "webgpu" ? "bg-marine" : "bg-accent"
                        }`}
                />
                {detail.backend === "webgpu" ? "WEBGPU" : "WEBGL2"}
                <span className="text-border">/</span>
                {detail.particleCount.toLocaleString("en-US")} PARTICLES
            </div>
        </div>
    );
}
