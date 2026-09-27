"use client";

import { useEffect, useRef } from "react";

/**
 * カードの上で流す短い映像。画面に入ってから読み込み、外れたら止める。
 * 通信を節約する設定・動きを減らす設定のときは、静止画のままにする。
 */
export default function LogVideo({ src }: { src: string }) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
        // スマホ（狭い画面）では通信量を考えて静止画のままにする
        const small = window.matchMedia("(max-width: 899px)").matches;
        if (reduced || saveData || small) return;
        const media = v.parentElement;
        let loaded = false;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    if (!loaded) {
                        v.src = src;
                        loaded = true;
                    }
                    v.play()
                        .then(() => media?.classList.add("is-playing"))
                        .catch(() => {});
                } else {
                    v.pause();
                }
            },
            { threshold: 0.4 }
        );
        io.observe(v);
        return () => io.disconnect();
    }, [src]);

    return <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" />;
}
