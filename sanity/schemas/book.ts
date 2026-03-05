import { defineField, defineType } from "sanity";

export default defineType({
    name: "book",
    title: "著書",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "タイトル",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "subtitle",
            title: "サブタイトル",
            type: "string",
        }),
        defineField({
            name: "image",
            title: "表紙画像",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "link",
            title: "Amazonリンク",
            type: "url",
        }),
        defineField({
            name: "badge",
            title: "バッジ（例: Amazon 1位）",
            type: "string",
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
            subtitle: "subtitle",
            media: "image",
        },
    },
});
