import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: { index: "src/index.ts" },
    external: [
        "@sometic/adapter-contract",
        "@sometic/core",
        "@sometic/core/disposable",
        "@sometic/dom",
        "@sometic/dom/button",
        "@sometic/store",
        "jquery",
    ],
});
