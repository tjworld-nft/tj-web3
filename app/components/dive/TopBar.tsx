"use client";

import { useEffect, useRef, useState } from "react";
import { dive } from "./diveState";
import { DIVE_STOPS, formatDepth } from "./nav";
import { skyForMode, type TimeMode } from "./sky";
import { OceanAudio } from "./audio";

const MODES: TimeMode[] = ["live", "day", "golden", "night"];
const MODE_LABEL: Record<TimeMode, string> = {
    live: "いまの三浦",
    day: "昼の海",
    golden: "夕方の海",
    night: "夜の海",
};

function scrollToStop(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = id === "surface" ? 0 : el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior: dive.reducedMotion ? "auto" : "smooth" });
}

export default function TopBar() {
    const [mode, setMode] = useState<TimeMode>("live");
    const [label, setLabel] = useState({ clock: "--:--", period: "", periodKey: "day" });
    const [open, setOpen] = useState(false);
    const [sound, setSound] = useState(false);
    const audioRef = useRef<OceanAudio | null>(null);
    const depthRef = useRef<HTMLSpanElement>(null);

    const toggleSound = async () => {
        try {
            // AudioContext はクリックの処理の中で同期的に作る（iOS Safari で無音にならないように）
            if (!audioRef.current) audioRef.current = new OceanAudio();
            if (sound) {
                setSound(false);
                await audioRef.current.stop();
            } else {
                setSound(true);
                await audioRef.current.start();
            }
        } catch (e) {
            console.warn("[dive] 音を出せませんでした", e);
            setSound(false);
        }
    };

    useEffect(() => () => audioRef.current?.dispose(), []);

    // 表示中の時間帯（URL の ?time= を最初に反映）
    useEffect(() => {
        const sync = () => {
            const s = skyForMode(dive.timeMode);
            setMode(dive.timeMode);
            setLabel({ clock: s.clock, period: s.periodJa, periodKey: s.period });
            document.documentElement.dataset.sky = s.period;
        };
        sync();
        const timer = window.setInterval(sync, 20000);
        const unsub = dive.subscribe(() => {
            if (depthRef.current) {
                const v = `${formatDepth(dive.cameraDepth)}m`;
                if (depthRef.current.textContent !== v) depthRef.current.textContent = v;
            }
        });
        return () => {
            window.clearInterval(timer);
            unsub();
        };
    }, []);

    const cycle = () => {
        const next = MODES[(MODES.indexOf(dive.timeMode) + 1) % MODES.length];
        dive.timeMode = next;
        const s = skyForMode(next);
        setMode(next);
        setLabel({ clock: s.clock, period: s.periodJa, periodKey: s.period });
        document.documentElement.dataset.sky = s.period;
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <>
            <header className="topbar">
                <a
                    href="#surface"
                    className="brand"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToStop("surface");
                    }}
                >
                    <span className="brand__avatar">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/brand/tj-avatar-64.webp" alt="" width={30} height={30} />
                    </span>
                    <span className="brand__name">TJ</span>
                    <span className="brand__sub">吉田 哲司</span>
                    <span className="sr-only">（ページの先頭へ）</span>
                </a>
                <div className="topbar__right">
                    <span className="chip chip--depth mono" aria-hidden="true" ref={depthRef}>
                        0.0m
                    </span>
                    <button
                        type="button"
                        className="chip chip--time"
                        onClick={cycle}
                        title="空の時間帯を切り替える"
                    >
                        <span className="chip__dot" data-period={label.periodKey} />
                        <span className="chip__label">
                            {mode === "live" ? `三浦 ${label.clock} · ${label.period}` : MODE_LABEL[mode]}
                        </span>
                        <span className="sr-only">（空の時間帯を切り替える。いま: {MODE_LABEL[mode]}）</span>
                    </button>
                    <button
                        type="button"
                        className={`chip chip--sound ${sound ? "is-on" : ""}`}
                        aria-pressed={sound}
                        onClick={() => void toggleSound()}
                        title="海の音（ヘッドホン推奨）"
                    >
                        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <rect key={i} className="snd-bar" x={i * 3.4} y="0" width="2" height="12" rx="1" style={{ animationDelay: `${i * 0.13}s` }} />
                            ))}
                        </svg>
                        <span className="chip__label">{sound ? "SOUND ON" : "SOUND"}</span>
                        <span className="sr-only">（海の音を{sound ? "止める" : "鳴らす"}）</span>
                    </button>
                    <a href="#ask" className="chip chip--ask">
                        <span aria-hidden="true">✦</span>
                        <span className="chip__label">AIに聞く</span>
                        <span className="sr-only">（TJのことをAIに相談する）</span>
                    </a>
                    <button
                        type="button"
                        className="chip chip--menu"
                        aria-expanded={open}
                        aria-controls="dive-menu"
                        onClick={() => setOpen(true)}
                    >
                        MENU
                    </button>
                </div>
            </header>

            <nav
                id="dive-menu"
                className={`menu ${open ? "is-open" : ""}`}
                aria-label="ページ内の区切り"
                aria-hidden={!open}
            >
                <button type="button" className="chip menu__close" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                    CLOSE
                </button>
                <ol>
                    {DIVE_STOPS.map((s) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                tabIndex={open ? 0 : -1}
                                onClick={() => {
                                    setOpen(false);
                                    scrollToStop(s.id);
                                }}
                            >
                                {s.label}
                                <span>{s.depth.toLocaleString("en-US")}m</span>
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            type="button"
                            tabIndex={open ? 0 : -1}
                            onClick={() => {
                                setOpen(false);
                                document.getElementById("ask")?.scrollIntoView({ behavior: dive.reducedMotion ? "auto" : "smooth", block: "center" });
                            }}
                        >
                            ✦ AIに聞く
                            <span>ASK</span>
                        </button>
                    </li>
                </ol>
            </nav>
        </>
    );
}

export { scrollToStop };
