import { LINKS } from "../content";

const siteLinks = [
    { href: LINKS.marine, label: "三浦 海の学校" },
    { href: LINKS.aquabit, label: "AquaBit LAB" },
    { href: LINKS.music, label: "TJ Music" },
    { href: LINKS.lineStickers, label: "LINEスタンプ" },
];

const legalLinks = [
    { href: "/privacy-policy", label: "プライバシーポリシー" },
    { href: "/tokushoho", label: "特定商取引法" },
    { href: "/terms", label: "利用規約" },
];

export default function Footer() {
    return (
        <footer className="footer" data-depth="1000">
            <div className="wrap">
                <div className="footer__grid">
                    <div>
                        <p className="mono" style={{ color: "var(--ink)", fontWeight: 700, letterSpacing: "0.18em", margin: 0 }}>
                            TJ — 吉田 哲司
                        </p>
                        <p style={{ margin: "6px 0 0" }}>海にも、AIにも、深く潜る。</p>
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <ul className="footer__links">
                            {siteLinks.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <ul className="footer__links">
                            {legalLinks.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href}>{l.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="footer__note">
                    画面の海は、3Dライブラリを使わずに手で書いた WebGL2 のシェーダーで、ブラウザがその場で描いています。空の色は三浦（城ヶ島）の今の太陽の高さと月齢から、水温は気象庁「沿岸域の海面水温情報」相模湾の日別平年値（1991〜2020年）から出しています。深い所の水温はモデル値です。
                    ダイブコンピューターの数値は演出です。NDL（減圧不要限界）は PADI RDP の値を参考にした表示で、実際のダイビング計画には使わないでください。
                </p>
                <p className="footer__note" style={{ marginTop: 10 }}>
                    © {new Date().getFullYear()} TJ / AquaBit LAB
                </p>
            </div>
        </footer>
    );
}
