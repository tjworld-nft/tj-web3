/**
 * 三浦（城ヶ島あたり）の空。太陽の高度・方位と月齢を、見ている瞬間の時刻から計算する。
 * NOAA の簡易式（誤差は1度以内で、空の色を決めるには十分）。
 */

const LAT = 35.135; // 城ヶ島
const LON = 139.615;
const RAD = Math.PI / 180;

export type SkyState = {
    /** 太陽高度（度）。マイナスは地平線の下 */
    sunElevation: number;
    /** 太陽方位（度・北=0 東=90） */
    sunAzimuth: number;
    /** 月齢 0..1（0=新月 0.5=満月） */
    moonPhase: number;
    /** 表示用の日本時間 "17:42" */
    clock: string;
    /** 表示用の時間帯 */
    period: "dawn" | "day" | "golden" | "dusk" | "night";
    periodJa: string;
};

export type TimeMode = "live" | "day" | "golden" | "night";

export function skyAt(date: Date): SkyState {
    const ms = date.getTime();
    const jd = ms / 86400000 + 2440587.5;
    const n = jd - 2451545.0;

    // 太陽の視黄経
    const L = (280.46 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
    const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
    const eps = (23.439 - 0.0000004 * n) * RAD;

    const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
    const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));

    // 恒星時 → 時角
    const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
    const lst = (gmst * 15 + LON) * RAD;
    const ha = lst - ra;

    const lat = LAT * RAD;
    const sinAlt =
        Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha);
    const alt = Math.asin(sinAlt);
    const az = Math.atan2(
        -Math.sin(ha),
        Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(ha)
    );

    const sunElevation = alt / RAD;
    const sunAzimuth = ((az / RAD) % 360 + 360) % 360;

    // 月齢（2000-01-06 18:14 UTC の新月から）
    const synodic = 29.530588853;
    const days = (ms - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
    const moonPhase = ((days / synodic) % 1 + 1) % 1;

    const jst = new Date(ms + 9 * 3600 * 1000);
    const clock = `${String(jst.getUTCHours()).padStart(2, "0")}:${String(
        jst.getUTCMinutes()
    ).padStart(2, "0")}`;

    const morning = jst.getUTCHours() < 12;
    let period: SkyState["period"];
    if (sunElevation < -7) period = "night";
    else if (sunElevation < 1) period = morning ? "dawn" : "dusk";
    else if (sunElevation < 12) period = morning ? "dawn" : "golden";
    else period = "day";

    const periodJa = {
        dawn: "夜明け",
        day: "昼",
        golden: "夕方",
        dusk: "日暮れ",
        night: "夜",
    }[period];

    return { sunElevation, sunAzimuth, moonPhase, clock, period, periodJa };
}

/** 表示モードを反映した空（live 以外は代表的な時刻に固定する） */
export function skyForMode(mode: TimeMode, now = new Date()): SkyState {
    if (mode === "live") return skyAt(now);
    const live = skyAt(now);
    const preset = {
        day: { sunElevation: 48, sunAzimuth: 200, period: "day", periodJa: "昼", clock: "12:30" },
        golden: { sunElevation: 6, sunAzimuth: 262, period: "golden", periodJa: "夕方", clock: "17:20" },
        night: { sunElevation: -30, sunAzimuth: 300, period: "night", periodJa: "夜", clock: "21:40" },
    }[mode] as Pick<SkyState, "sunElevation" | "sunAzimuth" | "period" | "periodJa" | "clock">;
    return { ...live, ...preset };
}
