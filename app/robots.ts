import type { MetadataRoute } from "next";

const SITE_URL = "https://www.tj-web3.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Sanity Studio はクロール不要
        disallow: ["/studio", "/studio/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
