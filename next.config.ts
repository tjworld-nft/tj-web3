import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ホームディレクトリに余分な package-lock.json があるとワークスペースルートを
  // 誤検出して CSS の解決に失敗するため、このプロジェクトを明示的にルートにする。
  turbopack: {
    root: process.cwd(),
  },
  // 手元（~/Documents は iCloud 同期）では、ビルドの出力を同期しない名前にする。
  // iCloud が .next を「dev 2」のように複製すると、古いCSSが出続ける事故が起きたため。
  // Vercel では従来どおり .next。
  ...(process.env.VERCEL ? {} : { distDir: ".next.nosync" }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
