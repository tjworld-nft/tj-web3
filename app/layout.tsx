import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://www.tj-web3.com";
const SITE_NAME = "TJ | 海とAIのプロフェッショナル";
const DESCRIPTION =
  "PADIコースディレクター × AIデジタルクリエイター。25年以上のダイビング経験と最先端AI技術で、新しい価値を創造します。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | TJ",
  },
  description: DESCRIPTION,
  applicationName: "TJ Portfolio",
  authors: [{ name: "TJ（吉田哲司）", url: SITE_URL }],
  creator: "TJ（吉田哲司）",
  publisher: "AquaBit LAB",
  keywords: [
    "ティージェー",
    "TJ",
    "吉田哲司",
    "AI",
    "AIクリエイター",
    "ダイビング",
    "PADIコースディレクター",
    "ウェビナー",
    "デジタルクリエイター",
    "Web3",
    "三浦",
    "AquaBit LAB",
    "三浦海の学校",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: "TJ Portfolio",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "海とAIで、未来を創る — TJ（PADIコースディレクター × AIクリエイター）",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/og.jpg"],
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
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#03060e",
  colorScheme: "dark",
};

/** 構造化データ（Person + WebSite） */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "TJ（吉田哲司）",
      alternateName: "ティージェー",
      url: SITE_URL,
      image: `${SITE_URL}/tj.PNG`,
      jobTitle: ["PADIコースディレクター", "AIデジタルクリエイター"],
      description: DESCRIPTION,
      knowsAbout: [
        "スクーバダイビング",
        "PADI インストラクター育成",
        "スノーケリング",
        "SUP",
        "シーカヤック",
        "生成AI活用",
        "AIウェビナー",
        "Webサイト制作",
      ],
      worksFor: {
        "@type": "Organization",
        name: "AquaBit LAB",
        url: "https://aquabit-lab.com/",
      },
      sameAs: [
        "https://miura-diving.com/",
        "https://aquabit-lab.com/",
        "https://tj-music.com/",
        "https://store.line.me/stickershop/author/4627048/ja",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: "ja",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          // 構造化データは静的な自前オブジェクトのみを埋め込む
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
