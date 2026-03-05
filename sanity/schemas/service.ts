import { defineField, defineType } from "sanity";

export default defineType({
    name: "service",
    title: "サービスメニュー",
    type: "document",
    fields: [
        defineField({
            name: "name",
            title: "サービス名",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "detail",
            title: "詳細（例：最短3日間）",
            type: "string",
        }),
        defineField({
            name: "price",
            title: "価格",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "category",
            title: "カテゴリ",
            type: "string",
            options: {
                list: [
                    { title: "ウェビナー", value: "webinar" },
                    { title: "マリンアクティビティ", value: "marine" },
                ],
            },
            validation: (Rule) => Rule.required(),
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
            title: "name",
            subtitle: "price",
        },
    },
});
