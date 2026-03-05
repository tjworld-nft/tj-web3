"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { projectId, dataset, basePath } from "./sanity/lib/env";

export default defineConfig({
    name: "tj-web3",
    title: "TJ Portfolio CMS",
    projectId,
    dataset,
    basePath,
    plugins: [structureTool(), visionTool()],
    schema: {
        types: schemaTypes,
    },
});
