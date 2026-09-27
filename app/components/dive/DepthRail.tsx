"use client";

import { useEffect, useRef, useState } from "react";
import { dive } from "./diveState";
import { DIVE_STOPS } from "./nav";
import { scrollToStop } from "./TopBar";

/** 右端の水深の目盛り。ページの区切りへ移動するナビゲーションを兼ねる */
export default function DepthRail() {
    const meRef = useRef<HTMLSpanElement>(null);
    const [pos, setPos] = useState<Record<string, number>>({});
    const [current, setCurrent] = useState("surface");

    useEffect(() => {
        let lastKey = "";
        let lastCurrent = "surface";
        let tops: Record<string, number> = {};
        const unsub = dive.subscribe(() => {
            const max = Math.max(1, dive.docHeight - dive.viewH);
            // 目盛りの位置はレイアウトが変わったときだけ計算し直す（毎フレームは読まない）
            const key = `${dive.docHeight}|${dive.viewH}`;
            if (key !== lastKey) {
                lastKey = key;
                const next: Record<string, number> = {};
                tops = {};
                for (const s of DIVE_STOPS) {
                    const el = document.getElementById(s.id);
                    const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
                    tops[s.id] = top;
                    next[s.id] = s.id === "surface" ? 0 : Math.min(1, Math.max(0, (top - 40) / max));
                }
                setPos(next);
            }
            let cur: string = DIVE_STOPS[0].id;
            for (const s of DIVE_STOPS) {
                if ((tops[s.id] ?? 0) - dive.scrollY < dive.viewH * 0.45) cur = s.id;
            }
            if (cur !== lastCurrent) {
                lastCurrent = cur;
                setCurrent(cur);
            }
            const p = Math.min(1, Math.max(0, dive.scrollY / max));
            if (meRef.current) meRef.current.style.top = `${(p * 100).toFixed(2)}%`;
        });
        return unsub;
    }, []);

    return (
        <nav className="rail" aria-label="水深の目盛り（ページ内の移動）">
            <span className="rail__line" aria-hidden="true" />
            {DIVE_STOPS.map((s) => (
                <button
                    key={s.id}
                    type="button"
                    className={`rail__tick ${"limit" in s && s.limit ? "rail__tick--limit" : ""} ${current === s.id ? "is-current" : ""}`}
                    style={{ top: `${((pos[s.id] ?? 0) * 100).toFixed(2)}%` }}
                    onClick={() => scrollToStop(s.id)}
                    aria-current={current === s.id ? "location" : undefined}
                >
                    <span>
                        {s.label} · {s.depth.toLocaleString("en-US")}m
                    </span>
                </button>
            ))}
            <span className="rail__me" ref={meRef} aria-hidden="true" />
        </nav>
    );
}
