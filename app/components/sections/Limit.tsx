import { FUSION_WORKS } from "@/app/content";
import LogCard from "./LogCard";

const TAPE = "RECREATIONAL DIVING LIMIT 40m ── この先は言葉の海 ── BEYOND THE LIMIT ── ";

/** 40m。レクリエーショナルダイビングの限界水深。ここで海とAIがまざる（ハロクライン） */
export default function Limit() {
    const spans = ["span-3", "span-3", "", "", "", "span-6"];
    return (
        <section id="limit" className="sec" data-depth="30" aria-labelledby="limit-title">
            <div className="wrap">
                <div className="limit">
                    <span className="limit__num rv" data-depth="40" aria-hidden="true">
                        40<small>m</small>
                    </span>
                    <div className="limit__tape" aria-hidden="true">
                        <span>{TAPE.repeat(8)}</span>
                        <span>{TAPE.repeat(8)}</span>
                    </div>
                    <h2 id="limit-title" className="limit__title rv">
                        ふたつの海が、
                        <br />
                        <em>まざる層</em>。
                    </h2>
                    <p className="limit__text rv">
                        レジャーダイビングで潜れるのは、水深40mまで。そして海の中には、温度や塩分の違う水どうしが出会って、景色がゆらりと揺れる層があります。「躍層」です。
                        このサイトでは、その層を40mに置きました。ここに並ぶのは、海の仕事とAIの仕事が、いちばん深くまざり合った作品たち。
                    </p>
                </div>

                <div className="logs" data-depth="41">
                    {FUSION_WORKS.map((w, i) => (
                        <LogCard
                            key={w.id}
                            work={w}
                            no={i + 1}
                            className={spans[i]}
                            wide={spans[i] === "span-6"}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
