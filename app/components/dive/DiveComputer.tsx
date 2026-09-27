"use client";

import { useEffect, useRef } from "react";
import { dive } from "./diveState";
import {
    lightRemaining,
    noDecoLimit,
    OPEN_WATER_LIMIT,
    pressureAta,
    RECREATIONAL_LIMIT,
    seaSurfaceNormal,
    waterTemperature,
    zoneOf,
} from "./ocean";
import { formatDepth } from "./nav";

/**
 * 左の余白に立つ、細長いダイブコンピューター。
 * 値は React の state を通さず、毎フレーム DOM の文字を直接書き換える（再描画を起こさない）。
 * 数値はスクロールから計算した演出で、NDL は PADI RDP の値を参考にした表示。
 */
export default function DiveComputer() {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
        const $depth = q("[data-v=depth]");
        const $time = q("[data-v=time]");
        const $ndl = q("[data-v=ndl]");
        const $temp = q("[data-v=temp]");
        const $ata = q("[data-v=ata]");
        const $zone = q("[data-v=zone]");
        const $note = q("[data-v=note]");
        const $ndlLabel = q("[data-v=ndl-label]");
        const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-bar] i"));
        const asc = Array.from(el.querySelectorAll<HTMLElement>("[data-asc] i"));

        const sst = seaSurfaceNormal();
        let prevDepth = dive.cameraDepth;
        let prevT = performance.now();
        let rate = 0;
        let alarmUntil = 0;
        const cache: Record<string, string> = {};
        const set = (node: HTMLElement, key: string, value: string) => {
            if (cache[key] !== value) {
                cache[key] = value;
                node.textContent = value;
            }
        };
        const attr = (key: string, value: string) => {
            if (el.dataset[key] !== value) el.dataset[key] = value;
        };

        const update = () => {
            const now = performance.now();
            const depth = dive.cameraDepth;
            const dt = Math.max(0.001, (now - prevT) / 1000);
            // 浮上速度（m/s・上向きが正）
            const instant = (prevDepth - depth) / dt;
            rate = rate * 0.85 + instant * 0.15;
            prevDepth = depth;
            prevT = now;

            set($depth, "depth", formatDepth(depth));
            const elapsed = Math.floor((now - dive.startedAt) / 1000);
            set($time, "time", `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`);

            const ai = depth > RECREATIONAL_LIMIT;
            attr("mode", ai ? "ai" : "dive");
            const ndl = noDecoLimit(depth);
            set($ndlLabel, "ndlLabel", ai ? "MODE" : "NDL");
            set($ndl, "ndl", ai ? "AI" : depth < 1 ? "---" : ndl === null ? "DECO" : `${ndl}'`);
            set($temp, "temp", `${waterTemperature(depth, sst).toFixed(1)}°`);
            set($ata, "ata", pressureAta(depth).toFixed(depth >= 100 ? 0 : 1));
            set($zone, "zone", zoneOf(depth).en.split(" ")[0]);

            const L = lightRemaining(depth);
            const vals = [L.r, L.g, L.b];
            bars.forEach((b, i) => {
                const v = `scaleY(${Math.max(0.004, vals[i]).toFixed(3)})`;
                if (b.style.transform !== v) b.style.transform = v;
            });

            // 急浮上の警告（浅い所だけ・浮上の演出中は出さない）
            // 浮上の演出中は「ゆっくり上がっている」表示にとどめる
            const n = Math.max(0, Math.min(dive.ascending ? 2 : 5, Math.round(rate / 3)));
            asc.forEach((b, i) => {
                const on = i < n;
                b.classList.toggle("on", on);
                b.classList.toggle("hot", on && n >= 4);
            });
            if (!dive.ascending && depth < RECREATIONAL_LIMIT + 5 && rate > 9) alarmUntil = now + 1400;
            dive.alarm = now < alarmUntil;
            attr("alarm", String(dive.alarm));

            // 案内
            let note = "";
            if (dive.ascending) note = dive.safetyStopRemaining > 0 ? "SAFETY STOP" : "ASCENDING";
            else if (Math.abs(depth - OPEN_WATER_LIMIT) < 1.2) note = "OW LIMIT 18m";
            else if (depth > RECREATIONAL_LIMIT - 2 && depth < RECREATIONAL_LIMIT + 6) note = "40m → AI ZONE";
            attr("note", note);
            if (note) set($note, "note", note);
        };

        const unsub = dive.subscribe(update);
        update();
        return unsub;
    }, []);

    return (
        <div className="hud" ref={root} aria-hidden="true" data-alarm="false" data-mode="dive" data-note="">
            <span className="hud__alarm">SLOW</span>
            <span className="hud__note" data-v="note" />
            <div className="hud__block">
                <span className="hud__label">DEPTH</span>
                <span className="hud__depth" data-v="depth">
                    0.0
                </span>
                <span className="hud__unit">m</span>
            </div>
            <div className="hud__block">
                <span className="hud__label">TIME</span>
                <b data-v="time">00:00</b>
            </div>
            <div className="hud__block">
                <span className="hud__label" data-v="ndl-label">
                    NDL
                </span>
                <b data-v="ndl">---</b>
            </div>
            <div className="hud__block">
                <span className="hud__label">TEMP</span>
                <b data-v="temp">--.-°</b>
            </div>
            <div className="hud__block">
                <span className="hud__label">ATA</span>
                <b data-v="ata">1.0</b>
            </div>
            <div className="hud__block">
                <span className="hud__label">LIGHT</span>
                <div className="hud__spectrum" title="この水深に届いている光（赤・緑・青）">
                    {[
                        ["#ff6b6b", "R"],
                        ["#6bffb0", "G"],
                        ["#6bc8ff", "B"],
                    ].map(([c, k]) => (
                        <span key={k} className="hud__bar" data-bar>
                            <i style={{ background: c }} />
                        </span>
                    ))}
                </div>
            </div>
            <div className="hud__block">
                <span className="hud__label">ASC</span>
                <span className="hud__ascent" data-asc>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                </span>
            </div>
            <span className="hud__zone" data-v="zone">
                SURFACE
            </span>
        </div>
    );
}
