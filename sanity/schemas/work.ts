import { defineField, defineType } from "sanity";

export default defineType({
    name: "work",
    title: "実績・制作物",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "タイトル",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "description",
            title: "説明",
            type: "text",
            rows: 3,
        }),
        defineField({
            name: "link",
            title: "リンクURL",
            type: "url",
        }),
        defineField({
            name: "tags",
            title: "タグ",
            type: "array",
            of: [{ type: "string" }],
            options: { layout: "tags" },
        }),
        defineField({
            name: "category",
            title: "カテゴリ",
            type: "string",
            options: {
                list: [
                    { title: "マリン事業", value: "marine" },
                    { title: "AI・クリエイティブ", value: "ai" },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "image",
            title: "画像",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "order",
            title: "表示順",
            type: "number",
        }),
    ],
    orderings: [
        {
            title: "表示順",
            name: "orderAsc",
            by: [{ field: "order", direction: "asc" }],
        },
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "category",
            media: "image",
        },
    },
});
