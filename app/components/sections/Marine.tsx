import { LINKS } from "@/app/content";
import Torch from "./Torch";

export default function Marine() {
    return (
        <section id="marine" className="sec" data-depth="12" aria-labelledby="marine-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <span className="sec-head__depth" aria-hidden="true">
                        12<small>m</small>
                    </span>
                    <h2 id="marine-title" className="sec-head__title">
                        三浦の海で、
                        <br />
                        教える人を教える。
                    </h2>
                    <p className="sec-head__en">Course Director, in the sea of Miura.</p>
                </header>

                <div className="veil">
                    <p className="lead rv">
                        PADIコースディレクターは、インストラクターを育てることができる、PADIのプロ資格の最高位。
                        「分からないまま先へ進まない」「少人数で、一人ひとりを見る」——
                        泳げない人、ひとりで来る人、しばらく潜っていない人の最初の一歩から、プロを目指す人の養成まで、三浦の海で直接教えています。
                    </p>
                </div>

                <div className="marine">
                    <div className="rv">
                        <Torch
                            src="/works/kingyohanadai.webp"
                            alt="三浦の海で撮ったキンギョハナダイ。赤い魚が、赤い海藻の岩の前を泳いでいる"
                        />
                        <p className="torch-cap">
                            水は、赤い光から先に吸いこむ。水深18mまで届く赤い光は、水面のおよそ0.15%（水そのものが吸う分だけで計算）。だから赤い魚も、深いと灰緑色に見える。
                            ダイバーがライトを持って潜るのは、暗いからだけじゃない。<b>本当の色を見るため</b>。
                            <br />
                            <small className="mono" style={{ color: "var(--ink-3)" }}>
                                写真: キンギョハナダイ（三浦の海）
                            </small>
                        </p>
                    </div>

                    <div className="rv" style={{ "--rv-delay": "120ms" } as React.CSSProperties}>
                        <ul className="facts">
                            <li>
                                <span className="k">WHERE</span>
                                <span>城ヶ島・宮川湾（神奈川県三浦市）</span>
                            </li>
                            <li>
                                <span className="k">CLASS</span>
                                <span>インストラクター1名につき最大4名の少人数制</span>
                            </li>
                            <li>
                                <span className="k">FOR</span>
                                <span>体験ダイビング、ライセンス、ブランク明け、プロの養成まで</span>
                            </li>
                            <li>
                                <span className="k">SINCE</span>
                                <span>1997年から講習ひとすじ。三浦の海は約14年</span>
                            </li>
                            <li>
                                <span className="k">DIVERS</span>
                                <span>これまでに認定したダイバーは1,500名以上</span>
                            </li>
                        </ul>
                        <div className="btn-row">
                            <a className="btn btn--light" href={LINKS.marine} target="_blank" rel="noopener noreferrer">
                                三浦 海の学校へ <span className="btn__arrow">→</span>
                            </a>
                            <a className="btn btn--ghost" href={LINKS.instructor} target="_blank" rel="noopener noreferrer">
                                インストラクター紹介
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
