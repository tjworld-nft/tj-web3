import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ホームディレクトリに余分な package-lock.json があるとワークスペースルートを
  // 誤検出して CSS の解決に失敗するため、このプロジェクトを明示的にルートにする。
  turbopack: {
    root: process.cwd(),
  },
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
