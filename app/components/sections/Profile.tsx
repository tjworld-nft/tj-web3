import Image from "next/image";
import { CAREER, STATS } from "@/app/content";

/** キャリアを「ダイブプロファイル（潜水の軌跡）」のグラフで描く */
function CareerProfile() {
    const W = 1000;
    const H = 330;
    const x0 = 36;
    const x1 = W - 60;
    const top = 44;
    const span = 220;
    const pts = CAREER.map((c, i) => ({
        ...c,
        x: x0 + (i * (x1 - x0)) / (CAREER.length - 1),
        y: top + c.depth * span,
    }));
    // 水面から潜り始める
    const all = [{ x: x0 - 20, y: top }, ...pts];
    let d = `M ${all[0].x} ${all[0].y}`;
    for (let i = 1; i < all.length; i++) {
        const p0 = all[Math.max(0, i - 2)];
        const p1 = all[i - 1];
        const p2 = all[i];
        const p3 = all[Math.min(all.length - 1, i + 1)];
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
    }
    const area = `${d} L ${pts[pts.length - 1].x} ${top} L ${all[0].x} ${top} Z`;

    return (
        <div className="profile-log rv" data-watch>
            <div className="profile-log__head">
                <h3>キャリアのダイブプロファイル</h3>
                <span className="kicker">1997 → 2026 · MAX DEPTH: NOW</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="1997年のプロダイバーから、2026年のアプリ・アルバム・まんがまで、キャリアが深まっていく軌跡">
                <defs>
                    <linearGradient id="plGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" stopColor="#ffffff" />
                        <stop offset="0.45" stopColor="#7ff5ff" />
                        <stop offset="1" stopColor="#b6a2ff" />
                    </linearGradient>
                    <linearGradient id="plArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="rgba(127,245,255,0.16)" />
                        <stop offset="1" stopColor="rgba(127,245,255,0)" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((k) => (
                    <line key={k} className="pl-grid" x1={x0 - 20} x2={W - 20} y1={top + (k * span) / 3} y2={top + (k * span) / 3} />
                ))}
                <text className="pl-axis" x={W - 20} y={top - 10} textAnchor="end">
                    SURFACE
                </text>
                <path className="pl-area" d={area} />
                <path className="pl-path" d={d} pathLength={2000} style={{ "--len": 2000 } as React.CSSProperties} />
                {pts.map((p, i) => {
                    const below = i % 2 === 1;
                    const ty = below ? p.y + 30 : p.y - 46;
                    const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
                    return (
                        <g key={p.year}>
                            <circle className={`pl-dot ${i === pts.length - 1 ? "pl-dot--now" : ""}`} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 6 : 5} />
                            <text className="pl-year" x={p.x} y={ty} textAnchor={anchor}>
                                {p.year}
                            </text>
                            <text className="pl-title" x={p.x} y={ty + 17} textAnchor={anchor}>
                                {p.title}
                            </text>
                            {"note" in p && p.note && (
                                <text className="pl-note" x={p.x} y={ty + 33} textAnchor={anchor}>
                                    {p.note}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
            <ol className="career-list">
                {CAREER.map((c) => (
                    <li key={c.year}>
                        <b>{c.year}</b>
                        {c.title}
                        {"note" in c && c.note && <small>{c.note}</small>}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function Profile() {
    return (
        <section id="profile" className="sec" data-depth="5" aria-labelledby="profile-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <span className="sec-head__depth" aria-hidden="true">
                        5<small>m</small>
                    </span>
                    <h2 id="profile-title" className="sec-head__title">
                        潜る人。
                    </h2>
                    <p className="sec-head__en">A diver who builds with AI.</p>
                </header>

                <div className="profile">
                    <figure className="portrait rv">
                        <span className="portrait__ring" aria-hidden="true" />
                        <Image
                            src="/brand/tj-portrait.webp"
                            alt="TJのアバター。クラゲの帽子をかぶった、白い髪のキャラクター"
                            width={640}
                            height={640}
                            sizes="(max-width: 860px) 80vw, 420px"
                        />
                        <figcaption>AVATAR · クラゲ女子</figcaption>
                    </figure>
                    <div className="veil">
                        <p className="lead rv">
                            吉田 哲司（TJ／ティージェー）。<strong>1997年</strong>
                            、オーストラリアでプロダイバーになり、それからずっと「教えること」を仕事にしてきました。いまは、インストラクターを育てる
                            <strong>PADIコースディレクター</strong>
                            として、三浦の海（城ヶ島・宮川湾）で「三浦 海の学校」を営んでいます。
                        </p>
                        <p className="lead rv">
                            もうひとつの海は、AI。AquaBit LAB
                            の代表として、AIと一緒に本・音楽・まんが・映像・アプリ・Webをつくり、ウェビナーやサロンで「つくり方」を教えています。
                        </p>
                        <p className="lead rv">
                            怖さをほどいて、一歩ずつ、深い所へ。海で身につけたこの教え方は、AIでもそのまま通じました。6人の子どもの父です。
                        </p>
                    </div>
                </div>

                <ul className="stats" aria-label="実績">
                    {STATS.map((s, i) => (
                        <li key={s.label} className="rv" style={{ "--rv-delay": `${i * 60}ms` } as React.CSSProperties}>
                            <b>
                                {s.value}
                                {s.unit && <small>{s.unit}</small>}
                            </b>
                            <span>{s.label}</span>
                        </li>
                    ))}
                </ul>

                <CareerProfile />
            </div>
        </section>
    );
}
