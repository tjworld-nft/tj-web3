// Sanity環境変数
// Sanityプロジェクト作成後に値を設定してください

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-01-01";

// Sanity Studioを使う場合のベースパス
export const basePath = "/studio";
