import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TJ | 海とAIのプロフェッショナル",
  description:
    "PADIコースディレクター × AIデジタルクリエイター。25年以上のダイビング経験と最先端AI技術で、新しい価値を創造します。",
  keywords: [
    "ティージェー",
    "AI",
    "ダイビング",
    "PADIコースディレクター",
    "ウェビナー",
    "デジタルクリエイター",
    "Web3",
    "三浦",
  ],
  openGraph: {
    title: "TJ | 海とAIのプロフェッショナル",
    description:
      "PADIコースディレクター × AIデジタルクリエイター。25年以上のダイビング経験と最先端AI技術で、新しい価値を創造します。",
    url: "https://tj-web3.com",
    siteName: "TJ Portfolio",
    locale: "ja_JP",
    type: "website",
  },
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
