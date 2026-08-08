import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
    },
    external: [
        "@sometic/core",
        "@sometic/auth",
        "@sometic/http",
        "@sometic/query",
        "@sometic/head",
        "@sometic/theme",
        "@sometic/store",
        "@sometic/forms",
        "@sometic/http/auth",
        "@sometic/forms/server",
        "@sometic/head/seo",
        "@sometic/store/kinds",
    ],
});
