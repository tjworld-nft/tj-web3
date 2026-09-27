import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "水深404m — ページが見つかりません",
    robots: { index: false, follow: true },
};

/**
 * 見つからないページ。ダイビングの「バディとはぐれたら」の手順になぞらえている:
 * 1分探して見つからなければ、浮上して水面で落ち合う。
 */
export default function NotFound() {
    return (
        <main className="lost">
            <div className="lost__inner">
                <p className="kicker">DEPTH 404m · LOST BUDDY</p>
                <h1 className="lost__title">
                    <span className="phrase">このページとは、</span>
                    <span className="phrase">はぐれてしまいました。</span>
                </h1>
                <p className="lost__text">
                    ダイビングでバディとはぐれたら、まずその場で1分探す。見つからなければ、ゆっくり浮上して水面で落ち合う。
                    ——このページも、いったん水面に戻って探し直してください。
                </p>
                <ol className="lost__steps">
                    <li>
                        <b>01</b> 周りを1分探す（アドレスを見直す）
                    </li>
                    <li>
                        <b>02</b> 見つからなければ、ゆっくり浮上する
                    </li>
                    <li>
                        <b>03</b> 水面で落ち合う
                    </li>
                </ol>
                <Link href="/" className="btn btn--light">
                    水面（トップ）に戻る <span className="btn__arrow">↑</span>
                </Link>
            </div>
        </main>
    );
}
