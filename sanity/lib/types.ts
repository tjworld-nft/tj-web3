// Sanityから取得する著書データの型
export interface SanityBook {
    _id: string;
    title: string;
    subtitle?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any;
    link?: string;
    badge?: string;
    order?: number;
}

// Sanityから取得する実績データの型
export interface SanityWork {
    _id: string;
    title: string;
    description?: string;
    link?: string;
    tags?: string[];
    category: "marine" | "ai";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image?: any;
    order?: number;
}

// Sanityから取得するサービスデータの型
export interface SanityService {
    _id: string;
    name: string;
    detail?: string;
    price: string;
    category: "webinar" | "marine";
    order?: number;
}
