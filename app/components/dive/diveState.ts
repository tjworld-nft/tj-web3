/**
 * ページ全体で共有する「ダイブの状態」。
 * React の再レンダリングを経由せず、背景の描画・HUD・CSS変数が同じ値を毎フレーム読む。
 *
 * 水深はスクロール位置から決まる。ページの中に data-depth="12" のような目印を置いておき、
 * その要素の上端がその水深、という対応を線形につないでいる（目印どうしの間は直線補間）。
 */

import type { TimeMode } from "./sky";

export type Anchor = { y: number; depth: number };

type Listener = () => void;

class DiveState {
    anchors: Anchor[] = [{ y: 0, depth: 0 }, { y: 1, depth: 1 }];
    docHeight = 1;
    viewW = 1;
    viewH = 1;
    scrollY = 0;
    /** 前フレームからのスクロール速度（px/s、下向きが正） */
    scrollVel = 0;
    pointerX = -9999;
    pointerY = -9999;
    pointerVX = 0;
    pointerVY = 0;
    pointerActive = false;
    /** 直近のクリック（波紋・ソナー）。engine が消費する */
    pulses: { x: number; y: number; t: number; strength: number }[] = [];
    timeMode: TimeMode = "live";
    reducedMotion = false;
    gpu: "none" | "webgl2" = "none";
    /** 浮上（安全停止）の演出中 */
    ascending = false;
    safetyStopRemaining = 0;
    /** この潜水での最大水深 */
    maxDepth = 0;
    /** 潜水の記録（経過秒と水深）。ダイブログの折れ線になる */
    profile: { t: number; d: number }[] = [];
    /** 深海でカーソルを動かした距離（px）＝言葉を光らせた量の目安 */
    lightPath = 0;
    /** 吐いた泡の数 */
    bubbles = 0;
    /** 安全停止をしたか */
    safetyStopDone = false;
    /** 急浮上の警告が出ているか */
    alarm = false;
    startedAt = typeof performance !== "undefined" ? performance.now() : 0;

    private listeners = new Set<Listener>();

    subscribe(fn: Listener) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
        };
    }

    emit() {
        for (const fn of this.listeners) fn();
    }

    /** ドキュメント上の y（px）の水深 */
    depthAt(y: number): number {
        const a = this.anchors;
        if (y <= a[0].y) return a[0].depth;
        for (let i = 1; i < a.length; i++) {
            if (y <= a[i].y) {
                const t = (y - a[i - 1].y) / Math.max(1, a[i].y - a[i - 1].y);
                return a[i - 1].depth + (a[i].depth - a[i - 1].depth) * t;
            }
        }
        return a[a.length - 1].depth;
    }

    /** 水深から、その水深になるドキュメント上の y（px） */
    yAtDepth(depth: number): number {
        const a = this.anchors;
        if (depth <= a[0].depth) return a[0].y;
        for (let i = 1; i < a.length; i++) {
            if (depth <= a[i].depth) {
                const t = (depth - a[i - 1].depth) / Math.max(1e-6, a[i].depth - a[i - 1].depth);
                return a[i - 1].y + (a[i].y - a[i - 1].y) * t;
            }
        }
        return a[a.length - 1].y;
    }

    /** いまの「自分の」水深（HUDに出す値） */
    get cameraDepth(): number {
        const lead = this.viewH * 0.42;
        const k = Math.min(1, this.scrollY / Math.max(1, lead));
        return Math.max(0, this.depthAt(this.scrollY + lead * k));
    }

    /** 自分がいる水深の目印の y（スクロールでそこへ行くときの位置） */
    scrollYForDepth(depth: number): number {
        const lead = this.viewH * 0.42;
        return Math.max(0, this.yAtDepth(depth) - lead);
    }

    measure() {
        if (typeof document === "undefined") return;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
        const sy = window.scrollY;
        const list: Anchor[] = [{ y: 0, depth: 0 }];
        for (const el of nodes) {
            const d = Number(el.dataset.depth);
            if (!Number.isFinite(d)) continue;
            list.push({ y: layoutTop(el, sy), depth: d });
        }
        list.sort((p, q) => p.y - q.y);
        // 深さは単調に増えるようにそろえる（レイアウトの都合で逆転した目印は捨てる）
        const mono: Anchor[] = [];
        for (const p of list) {
            const last = mono[mono.length - 1];
            if (!last || (p.y > last.y + 1 && p.depth > last.depth)) mono.push(p);
        }
        const docH = document.documentElement.scrollHeight;
        const last = mono[mono.length - 1];
        if (last.y < docH) mono.push({ y: docH, depth: last.depth + 1 });
        this.anchors = mono;
        this.docHeight = docH;
        this.viewW = window.innerWidth;
        this.viewH = window.innerHeight;
    }
}

/**
 * 要素のドキュメント上の上端。transform（浮かび上がる演出の translate など）を無視した、レイアウト上の位置を返す。
 * position: fixed の祖先があるときだけは getBoundingClientRect に頼る。
 */
function layoutTop(el: HTMLElement, scrollY: number): number {
    let y = 0;
    let node: HTMLElement | null = el;
    while (node) {
        y += node.offsetTop;
        const parent = node.offsetParent as HTMLElement | null;
        if (!parent && getComputedStyle(node).position === "fixed") {
            return el.getBoundingClientRect().top + scrollY;
        }
        node = parent;
    }
    return y;
}

export const dive = new DiveState();

if (typeof window !== "undefined") {
    // 開発用: コンソールから状態を見られるようにする
    (window as unknown as { __dive: DiveState }).__dive = dive;
}
