"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 要素が一度でもビューポートに入ったら true を返す（スクロール演出用）。
 *
 * IntersectionObserver が無い / 何らかの理由で発火しない環境でも
 * 中身が永久に非表示にならないよう、保険のタイマーで必ず表示させる。
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
    threshold = 0.08
) {
    const ref = useRef<T>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const supported = typeof IntersectionObserver !== "undefined";

        const observer = supported
            ? new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer?.disconnect();
                    }
                },
                { threshold }
            )
            : null;
        observer?.observe(el);

        // 保険: 監視できない、またはすでに画面内なのに発火しないケースを拾う
        const fallback = window.setTimeout(
            () => {
                if (!observer) {
                    setIsInView(true);
                    return;
                }
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            supported ? 1200 : 0
        );

        return () => {
            window.clearTimeout(fallback);
            observer?.disconnect();
        };
    }, [threshold]);

    return { ref, isInView };
}
