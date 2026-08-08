import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "tokens/index": "src/tokens/index.ts",
        "css-variables/index": "src/css-variables/index.ts",
        "contrast/index": "src/contrast/index.ts",
        "system/index": "src/system/index.ts",
        "presets/index": "src/presets/index.ts",
    },
    external: [
        "@sometic/core",
        "@sometic/core/disposable",
        "@sometic/core/environment",
        "@sometic/core/error",
        "@sometic/store",
        "@sometic/store/persistent",
        "@sometic/styling",
        "@sometic/styling/styles",
    ],
});
