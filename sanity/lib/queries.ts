import { groq } from "next-sanity";

// 著書一覧を取得
export const booksQuery = groq`
  *[_type == "book"] | order(order asc) {
    _id,
    title,
    subtitle,
    image,
    link,
    badge,
    order
  }
`;

// 実績・制作物を取得
export const worksQuery = groq`
  *[_type == "work"] | order(order asc) {
    _id,
    title,
    description,
    link,
    tags,
    category,
    image,
    order
  }
`;

// サービスメニューを取得
export const servicesQuery = groq`
  *[_type == "service"] | order(order asc) {
    _id,
    name,
    detail,
    price,
    category,
    order
  }
`;
