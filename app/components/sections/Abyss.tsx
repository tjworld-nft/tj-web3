import Image from "next/image";
import { ASK_AI_PROMPT, ASK_AI_TARGETS, LINKS } from "@/app/content";
import Ascend from "../dive/Ascend";
import DiveLog from "../dive/DiveLog";

export default function Abyss() {
    return (
        <section id="abyss" className="sec abyss" data-depth="800" aria-labelledby="abyss-title">
            <div className="wrap">
                <p className="kicker rv">800m — BATHYPELAGIC</p>
                <h2 id="abyss-title" className="abyss__title rv">
                    <span className="phrase">ここまで</span>
                    <span className="phrase">潜ってくれて、</span>
                    <br />
                    <span className="phrase">ありがとう。</span>
                </h2>
                <p className="abyss__text rv">
                    AIを学びたい、つくってほしい、講座や講演で話してほしい、海に潜ってみたい。
                    どれでも、まずはひと言ください。いちばん早いのは LINE です。
                </p>

                <div className="contact rv">
                    <div className="contact__qr">
                        <Image src="/line-qr.png" alt="LINE公式アカウントのQRコード" width={148} height={148} />
                    </div>
                    <div>
                        <h3>LINE公式アカウント</h3>
                        <p>
                            ウェビナーのお知らせ、制作や講座のご相談はこちらから。友だち追加して、ひと言送るだけで大丈夫です。
                        </p>
                        <div className="btn-row" style={{ marginTop: 18 }}>
                            <a className="btn btn--line" href={LINKS.line} target="_blank" rel="noopener noreferrer">
                                友だち追加して相談する <span className="btn__arrow">→</span>
                            </a>
                        </div>
                    </div>
                </div>

                <ul className="routes">
                    <li className="rv">
                        <a className="route" href={LINKS.aquabit} target="_blank" rel="noopener noreferrer">
                            <small>AI · LEARN & BUILD</small>
                            <b>AIを学ぶ・つくってもらう</b>
                            <span>AquaBit LAB（サロン・講座・制作）</span>
                        </a>
                    </li>
                    <li className="rv" style={{ "--rv-delay": "80ms" } as React.CSSProperties}>
                        <a className="route" href={LINKS.marine} target="_blank" rel="noopener noreferrer">
                            <small>DIVE · MIURA</small>
                            <b>三浦の海で潜る</b>
                            <span>三浦 海の学校（体験〜プロ養成）</span>
                        </a>
                    </li>
                    <li className="rv" style={{ "--rv-delay": "160ms" } as React.CSSProperties}>
                        <a className="route" href={LINKS.music} target="_blank" rel="noopener noreferrer">
                            <small>LISTEN · TJ MUSIC</small>
                            <b>海の歌を聴く</b>
                            <span>3rdアルバム「魚歌」配信中</span>
                        </a>
                    </li>
                </ul>

                <div className="ask rv" id="ask">
                    <h3>✦ AIに、TJのことを聞いてみる</h3>
                    <p>
                        このサイトは、AIが読むための案内（llms.txt）も置いています。お使いのAIに「自分の目的に合うか」を相談してから、声をかけてください。
                    </p>
                    <div className="ask__btns">
                        {ASK_AI_TARGETS.map((t) => (
                            <a key={t.name} className="ask__btn" href={t.href(ASK_AI_PROMPT)} target="_blank" rel="noopener noreferrer">
                                {t.name}で聞く <span aria-hidden="true">↗</span>
                            </a>
                        ))}
                    </div>
                    <p className="ask__note">※ 回答はAIによるものです。最新の情報・ご依頼はLINEでご確認ください。</p>
                </div>

                <Ascend />
                <div className="divelog-row">
                    <DiveLog />
                </div>
            </div>
        </section>
    );
}
