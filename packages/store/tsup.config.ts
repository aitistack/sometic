import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "persistent/index": "src/persistent/index.ts",
        "cross-tab/index": "src/cross-tab/index.ts",
        "kinds/index": "src/kinds/index.ts",
    },
    external: [
        "@sometic/core",
        "@sometic/core/disposable",
        "@sometic/core/error",
        "@sometic/core/id",
        "@sometic/core/utils",
    ],
});
