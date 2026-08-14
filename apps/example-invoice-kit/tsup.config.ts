import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
    },
    external: [
        "@sometic/app-shell",
        "@sometic/auth",
        "@sometic/drafts",
        "@sometic/feature-flags",
        "@sometic/http",
        "@sometic/validation",
        "@sometic/core",
        "@sometic/core/disposable",
        "@sometic/core/error",
    ],
});
