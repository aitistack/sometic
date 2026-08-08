import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "auth/index": "src/auth/index.ts",
        "retry/index": "src/retry/index.ts",
    },
    external: ["@sometic/core", "@sometic/core/error", "@sometic/auth"],
});
