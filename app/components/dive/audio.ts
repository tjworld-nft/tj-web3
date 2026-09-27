/**
 * 海の音（WebAudio で合成。音源ファイルは使わない）。最初はオフで、押した人だけに鳴る。
 *
 *   水面        … 波が寄せては返す音
 *   水中        … こもった水の音。深くなるほど低く、暗くなる
 *   40mを越える … ふたつの水がまざる「ざわっ」という音
 *   言葉の海    … カーソルで文字を光らせると、小さな鈴の音（五音音階）
 *   泡          … ぽこっ
 *   計器        … 急浮上の警告と、安全停止の電子音（ダイブコンピューターの音）
 */

import { dive } from "./diveState";
import { RECREATIONAL_LIMIT } from "./ocean";

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];

export class OceanAudio {
    private ctx: AudioContext;
    private master: GainNode;
    private bedFilter: BiquadFilterNode;
    private bedGain: GainNode;
    private waveGain: GainNode;
    private droneGain: GainNode;
    private noise: AudioBuffer;
    private unsub: (() => void) | null = null;
    private lastBubbles = dive.bubbles;
    private lastLight = dive.lightPath;
    private lastDepth = 0;
    private lastChime = 0;
    private lastBubbleSound = 0;
    private lastAlarm = false;
    private lastStop = 0;
    private raf = 0;
    /** start/stop が入れ違ったときに、古い stop が新しい start を消さないための番号 */
    private generation = 0;

    constructor() {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new Ctx();
        const c = this.ctx;
        this.master = c.createGain();
        this.master.gain.value = 0;
        this.master.connect(c.destination);

        // 茶色いノイズ（低い音が多い）を2秒ぶん作ってループさせる
        this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
        const data = this.noise.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            last = (last + 0.02 * white) / 1.02;
            data[i] = last * 3.2;
        }

        // 水のこもった音
        const bed = c.createBufferSource();
        bed.buffer = this.noise;
        bed.loop = true;
        this.bedFilter = c.createBiquadFilter();
        this.bedFilter.type = "lowpass";
        this.bedFilter.frequency.value = 900;
        this.bedFilter.Q.value = 0.4;
        this.bedGain = c.createGain();
        this.bedGain.gain.value = 0.5;
        bed.connect(this.bedFilter).connect(this.bedGain).connect(this.master);
        bed.start();

        // 水面の波（ゆっくり大きくなったり小さくなったり）
        const wave = c.createBufferSource();
        wave.buffer = this.noise;
        wave.loop = true;
        wave.playbackRate.value = 1.7;
        const wf = c.createBiquadFilter();
        wf.type = "bandpass";
        wf.frequency.value = 700;
        wf.Q.value = 0.6;
        this.waveGain = c.createGain();
        this.waveGain.gain.value = 0;
        const lfo = c.createOscillator();
        lfo.frequency.value = 0.11;
        const lfoGain = c.createGain();
        lfoGain.gain.value = 0.35;
        const swell = c.createGain();
        swell.gain.value = 0.45;
        lfo.connect(lfoGain).connect(swell.gain);
        wave.connect(wf).connect(swell).connect(this.waveGain).connect(this.master);
        wave.start();
        lfo.start();

        // 深海の低いうなり（言葉の海で大きくなる）
        this.droneGain = c.createGain();
        this.droneGain.gain.value = 0;
        const droneFilter = c.createBiquadFilter();
        droneFilter.type = "lowpass";
        droneFilter.frequency.value = 400;
        for (const [f, g] of [
            [55, 0.5],
            [82.4, 0.28],
            [110.3, 0.12],
        ] as const) {
            const o = c.createOscillator();
            o.type = "sine";
            o.frequency.value = f;
            const og = c.createGain();
            og.gain.value = g;
            const det = c.createOscillator();
            det.frequency.value = 0.05 + Math.random() * 0.05;
            const detG = c.createGain();
            detG.gain.value = 0.8;
            det.connect(detG).connect(o.frequency);
            o.connect(og).connect(droneFilter);
            o.start();
            det.start();
        }
        droneFilter.connect(this.droneGain).connect(this.master);
    }

    async start() {
        const gen = ++this.generation;
        // resume() はクリックの処理の中で同期的に呼ぶ（iOS Safari の自動再生の制限のため）
        const resumed = this.ctx.resume();
        cancelAnimationFrame(this.raf);
        await resumed;
        if (gen !== this.generation) return;
        const t = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setValueAtTime(this.master.gain.value, t);
        this.master.gain.linearRampToValueAtTime(0.55, t + 1.2);
        this.lastBubbles = dive.bubbles;
        this.lastLight = dive.lightPath;
        this.lastDepth = dive.cameraDepth;
        const loop = () => {
            this.raf = requestAnimationFrame(loop);
            this.update();
        };
        this.raf = requestAnimationFrame(loop);
    }

    async stop() {
        const gen = ++this.generation;
        cancelAnimationFrame(this.raf);
        const t = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setValueAtTime(this.master.gain.value, t);
        this.master.gain.linearRampToValueAtTime(0, t + 0.5);
        await new Promise((r) => setTimeout(r, 550));
        if (gen === this.generation) await this.ctx.suspend();
    }

    dispose() {
        cancelAnimationFrame(this.raf);
        this.unsub?.();
        void this.ctx.close();
    }

    private update() {
        const c = this.ctx;
        const now = c.currentTime;
        const d = dive.cameraDepth;
        const ai = d > RECREATIONAL_LIMIT;

        // 深くなるほど低く・暗く
        const cutoff = d < 0.8 ? 1400 : Math.max(140, 1100 * Math.exp(-d / 26));
        this.bedFilter.frequency.setTargetAtTime(cutoff, now, 0.25);
        this.bedGain.gain.setTargetAtTime(d < 0.8 ? 0.25 : ai ? 0.18 : 0.5, now, 0.4);
        this.waveGain.gain.setTargetAtTime(d < 0.8 ? 0.9 : 0, now, 0.5);
        this.droneGain.gain.setTargetAtTime(ai ? Math.min(0.28, 0.1 + (d - 40) / 1200) : 0, now, 1.2);

        // 40m の境目を越えた
        if ((this.lastDepth - RECREATIONAL_LIMIT) * (d - RECREATIONAL_LIMIT) < 0) this.whoosh();
        this.lastDepth = d;

        // 泡
        const b = dive.bubbles;
        if (b > this.lastBubbles && performance.now() - this.lastBubbleSound > 70) {
            this.bubble(Math.min(4, b - this.lastBubbles));
            this.lastBubbleSound = performance.now();
        }
        this.lastBubbles = b;

        // 言葉を光らせた
        const L = dive.lightPath;
        if (ai && L - this.lastLight > 60 && performance.now() - this.lastChime > 180) {
            this.chime(dive.pointerX / Math.max(1, dive.viewW));
            this.lastChime = performance.now();
            this.lastLight = L;
        } else if (!ai) {
            this.lastLight = L;
        }

        // 計器の音
        if (dive.alarm && !this.lastAlarm) this.beep([2400, 2400, 2400], 0.07, 0.09);
        this.lastAlarm = dive.alarm;
        if (dive.safetyStopRemaining !== this.lastStop) {
            if (dive.safetyStopRemaining > 0) this.beep([1760], 0.09, 0);
            else if (this.lastStop > 0) this.beep([1760, 2350], 0.09, 0.12);
            this.lastStop = dive.safetyStopRemaining;
        }
    }

    private env(g: GainNode, peak: number, attack: number, decay: number) {
        const t = this.ctx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    }

    private bubble(n: number) {
        const c = this.ctx;
        for (let i = 0; i < n; i++) {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = "sine";
            const t = c.currentTime + i * 0.035;
            const f = 380 + Math.random() * 420;
            o.frequency.setValueAtTime(f, t);
            o.frequency.exponentialRampToValueAtTime(f * 2.4, t + 0.06);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.08, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
            o.connect(g).connect(this.master);
            o.start(t);
            o.stop(t + 0.12);
        }
    }

    private chime(x: number) {
        const c = this.ctx;
        const step = PENTA[Math.min(PENTA.length - 1, Math.max(0, Math.floor(x * PENTA.length)))];
        const f = 523.25 * Math.pow(2, step / 12);
        for (const [mult, amp] of [
            [1, 0.05],
            [2.76, 0.018],
            [5.4, 0.008],
        ] as const) {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = "sine";
            o.frequency.value = f * mult;
            o.connect(g).connect(this.master);
            this.env(g, amp, 0.005, 1.6 / mult);
            o.start();
            o.stop(c.currentTime + 2);
        }
    }

    private whoosh() {
        const c = this.ctx;
        const src = c.createBufferSource();
        src.buffer = this.noise;
        src.playbackRate.value = 2.4;
        const f = c.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 1.2;
        const t = c.currentTime;
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(2600, t + 0.9);
        f.frequency.exponentialRampToValueAtTime(500, t + 2);
        const g = c.createGain();
        src.connect(f).connect(g).connect(this.master);
        this.env(g, 0.35, 0.4, 1.6);
        src.start(t);
        src.stop(t + 2.2);
    }

    private beep(freqs: number[], len: number, gap: number) {
        const c = this.ctx;
        let t = c.currentTime + 0.01;
        for (const f of freqs) {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = "square";
            o.frequency.value = f;
            const lp = c.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 3500;
            o.connect(lp).connect(g).connect(this.master);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.035, t + 0.004);
            g.gain.setValueAtTime(0.035, t + len - 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + len);
            o.start(t);
            o.stop(t + len + 0.02);
            t += len + gap;
        }
    }
}
