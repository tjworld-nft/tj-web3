import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { BOOKS, LINKS, SITE_URL } from "./content";
import "./globals.css";

/*
 * 日本語フォントの方針（表示の速さのため）
 *  - 本文: 端末の日本語ゴシック（ヒラギノ角ゴ / Noto Sans CJK / 游ゴシック）。Webフォントを読まない
 *  - 見出しの明朝: Shippori Mincho B1 を「このサイトで使う字だけ」に絞った woff2（約50KB）を自前で配信
 *    → public/fonts/ と tools/subset-mincho.py
 *  - 英字: JetBrains Mono（計器）と Instrument Serif（斜体のアクセント）
 */
const mono = JetBrains_Mono({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

const serif = Instrument_Serif({
    weight: ["400"],
    style: ["normal", "italic"],
    subsets: ["latin"],
    variable: "--font-serif",
    display: "swap",
});

const TITLE = "TJ（吉田哲司）｜海にも、AIにも、深く潜る。";
const DESCRIPTION =
    "PADIコースディレクター × AIクリエイター、TJ（吉田哲司）のポートフォリオ。三浦の海で1,500名以上のダイバーを育て、AIで本・音楽・まんが・アプリ・映像をつくる。水面から深海まで、スクロールで潜るひとつのダイビングとして作りました。";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: TITLE,
        template: "%s | TJ",
    },
    description: DESCRIPTION,
    applicationName: "TJ Portfolio",
    authors: [{ name: "TJ（吉田哲司）", url: SITE_URL }],
    creator: "TJ（吉田哲司）",
    publisher: "AquaBit LAB",
    keywords: [
        "TJ",
        "ティージェー",
        "吉田哲司",
        "PADIコースディレクター",
        "AIクリエイター",
        "AIウェビナー",
        "Vibe Coding",
        "Claude Code",
        "三浦 海の学校",
        "AquaBit LAB",
        "Blue Logbook",
        "魚歌",
        "WebGL",
        "ポートフォリオ",
    ],
    alternates: { canonical: "/" },
    openGraph: {
        type: "profile",
        locale: "ja_JP",
        url: SITE_URL,
        siteName: "TJ Portfolio",
        title: TITLE,
        description: DESCRIPTION,
        images: [
            {
                url: "/og-dive-2026-09.jpg",
                width: 1200,
                height: 630,
                alt: "海にも、AIにも、深く潜る。— TJ（PADIコースディレクター × AIクリエイター）",
                type: "image/jpeg",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        images: ["/og-dive-2026-09.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    formatDetection: { telephone: false },
};

export const viewport: Viewport = {
    themeColor: "#0b5f78",
    colorScheme: "dark",
};

/**
 * 最初の描画の前に走る小さなスクリプト。
 *  - JS が動く環境だけ、スクロールで浮かび上がる演出を有効にする
 *  - GPU の海が立ち上がるまでの CSS の空を、三浦の今の時間帯に合わせておく（夜に一瞬だけ昼の空が出ないように）
 */
const EARLY_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var q=new URLSearchParams(location.search).get('time');var h=(new Date().getUTCHours()+9)%24;var s=q==='day'||q==='golden'||q==='night'?q:(h>=19||h<5?'night':h>=16?'golden':'day');d.dataset.sky=s;}catch(e){}})();`;

/** 構造化データ（Person + WebSite + 作品） */
const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": `${SITE_URL}/#person`,
            name: "吉田哲司",
            alternateName: ["TJ", "ティージェー", "Tetsuji Yoshida"],
            url: SITE_URL,
            image: `${SITE_URL}/brand/tj-portrait.webp`,
            jobTitle: ["PADIコースディレクター", "AIクリエイター"],
            description: DESCRIPTION,
            knowsAbout: [
                "スクーバダイビング",
                "PADI インストラクター育成",
                "生成AI",
                "Vibe Coding",
                "AIウェビナー",
                "AI音楽制作",
                "iOSアプリ開発",
                "WebGL / WebGPU",
            ],
            worksFor: [
                { "@type": "Organization", name: "AquaBit LAB", url: LINKS.aquabit },
                { "@type": "Organization", name: "三浦 海の学校", url: LINKS.marine },
            ],
            sameAs: [
                LINKS.marine,
                LINKS.instructor,
                LINKS.aquabit,
                LINKS.music,
                LINKS.spotifyArtist,
                LINKS.appleMusicArtist,
                LINKS.lineStickers,
            ],
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: TITLE,
            description: DESCRIPTION,
            inLanguage: "ja",
            publisher: { "@id": `${SITE_URL}/#person` },
        },
        {
            "@type": "MobileApplication",
            name: "Blue Logbook",
            operatingSystem: "iOS",
            applicationCategory: "SportsApplication",
            url: LINKS.blueLogbook,
            author: { "@id": `${SITE_URL}/#person` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        },
        {
            "@type": "MobileApplication",
            name: "いまメシ",
            operatingSystem: "iOS",
            applicationCategory: "FoodAndDrinkApplication",
            url: LINKS.imameshi,
            author: { "@id": `${SITE_URL}/#person` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        },
        {
            "@type": "MusicAlbum",
            name: "魚歌 - UO-UTA -",
            byArtist: { "@type": "MusicGroup", name: "ティージェー", url: LINKS.music },
            numTracks: 19,
            datePublished: "2026-07-30",
            url: LINKS.music,
        },
        ...BOOKS.map((b) => ({
            "@type": "Book",
            name: b.title,
            author: { "@id": `${SITE_URL}/#person` },
            url: b.link,
        })),
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="ja"
            suppressHydrationWarning
            className={`${mono.variable} ${serif.variable}`}
        >
            <head>
                <link
                    rel="preload"
                    href="/fonts/shippori-mincho-b1-800-subset.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                {/* JS が動く環境だけ、スクロールで浮かび上がる演出を有効にする */}
                <script dangerouslySetInnerHTML={{ __html: EARLY_SCRIPT }} />
                <script
                    type="application/ld+json"
                    // 構造化データは静的な自前オブジェクトのみを埋め込む
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
