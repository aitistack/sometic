import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "seo/index": "src/seo/index.ts",
    },

    external: ["@sometic/core", "@sometic/core/disposable"],
});
