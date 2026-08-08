import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
    },
    external: ["@sometic/core", "@sometic/core/disposable"],
});
