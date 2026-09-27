import { AI_WORKS, LINKS, TOPICS } from "@/app/content";
import LogCard from "./LogCard";

const BUDDIES = [
    "Claude Code",
    "Codex",
    "Next.js",
    "WebGL2 / WebGPU",
    "three.js",
    "Flutter",
    "SwiftUI",
    "Remotion",
    "Suno",
    "画像生成AI",
    "動画生成AI",
    "音声合成AI",
    "LINE Messaging API",
];

/** 言葉の海（AI）。背景の文字のプランクトンは、カーソルで触れると光る */
export default function Words() {
    const spans = ["span-4", "", "span-3", "span-3", "span-6"];
    return (
        <section id="words" className="sec" data-depth="48" aria-labelledby="words-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <span className="sec-head__depth" aria-hidden="true">
                        48<small>m</small>
                    </span>
                    <h2 id="words-title" className="sec-head__title">
                        言葉の海。
                    </h2>
                    <p className="sec-head__en">Diving into the sea of words.</p>
                </header>

                <div className="words-lead">
                    <p className="quote rv">
                        AIは、人が書いてきた
                        <br />
                        <span>膨大な言葉の海</span>から生まれた。
                        <br />
                        だから、潜り方がある。
                    </p>
                    <div className="veil">
                        <p className="lead rv">
                            深海では、光は上からは来ません。生きものが自分で光る。——
                            AIも同じで、深く潜るほど、明かりは自分でつくるものになります。
                            プロンプトの書き方から、アプリや映像を一本つくり切るところまで。潜った分だけ、教えられることが増えました。
                        </p>
                        <p className="lead rv" style={{ fontSize: "0.9rem", color: "var(--ink-3)" }}>
                            ※ 背景の文字は、カーソル（指）で触れると夜光虫のように光ります。
                        </p>
                    </div>
                </div>

                <div className="logs">
                    {AI_WORKS.map((w, i) => (
                        <LogCard
                            key={w.id}
                            work={w}
                            no={i + 7}
                            className={spans[i]}
                            wide={spans[i] === "span-6"}
                        />
                    ))}
                </div>

                <div className="topics rv">
                    <div className="topics__head">
                        <h3>話せること・教えられること</h3>
                        <span className="kicker">Webinar · 50+ sessions · 500+ people</span>
                    </div>
                    <p className="lead" style={{ marginTop: 12, fontSize: "0.92rem", color: "var(--ink-2)" }}>
                        ウェビナーは匿名・顔出しなしで参加できる40〜80分。講座・講演・企業研修のご相談も受けています。
                    </p>
                    <ul className="topics__list">
                        {TOPICS.map((t, i) => (
                            <li key={t} className="token" data-i={String(i + 1).padStart(2, "0")}>
                                {t}
                            </li>
                        ))}
                    </ul>
                    <div className="buddies" aria-label="いっしょに潜る道具">
                        <b>BUDDY</b>
                        {BUDDIES.map((b) => (
                            <span key={b}>{b}</span>
                        ))}
                    </div>
                    <div className="btn-row">
                        <a className="btn btn--light" href={LINKS.aquabit} target="_blank" rel="noopener noreferrer">
                            AquaBit LAB で詳しく <span className="btn__arrow">→</span>
                        </a>
                        <a className="btn btn--ghost" href="#abyss">
                            依頼・相談する
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
