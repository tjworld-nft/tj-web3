import Image from "next/image";
import { BOOKS } from "@/app/content";

export default function Library() {
    const count = (s: string) => BOOKS.filter((b) => b.shelf === s).length;
    return (
        <section id="library" className="sec" data-depth="420" aria-labelledby="library-title">
            <div className="wrap">
                <header className="sec-head rv">
                    <span className="sec-head__depth" aria-hidden="true">
                        420<small>m</small>
                    </span>
                    <h2 id="library-title" className="sec-head__title">
                        深海の書庫。
                    </h2>
                    <p className="sec-head__en">Twelve books, glowing in the dark.</p>
                </header>

                <p className="shelf-legend rv">
                    <span>海とダイビング — {count("sea")}冊</span>
                    <span>AI — {count("ai")}冊</span>
                    <span>AI絵本 — {count("picture")}冊</span>
                    <span>Kindle Unlimited で読める本も</span>
                </p>

                <ul className="library">
                    {BOOKS.map((b, i) => (
                        <li key={b.title} className="rv" style={{ "--rv-delay": `${(i % 6) * 60}ms` } as React.CSSProperties}>
                            <a className="book" href={b.link} target="_blank" rel="noopener noreferrer">
                                <div className="book__cover">
                                    <Image
                                        src={b.image}
                                        alt={`『${b.title}』の表紙`}
                                        fill
                                        sizes="(max-width: 560px) 45vw, (max-width: 980px) 23vw, 190px"
                                    />
                                    {b.badge && <span className="book__badge">{b.badge}</span>}
                                </div>
                                <p className="book__title">{b.title}</p>
                                <p className="book__sub">{b.subtitle}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
