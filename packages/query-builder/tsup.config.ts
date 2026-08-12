import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
    },
    external: [
        "@sometic/core",
        "@sometic/core/controllable-state",
        "@sometic/core/disposable",
        "@sometic/core/error",
        "@sometic/core/id",
    ],
});
