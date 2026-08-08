import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        provider: "src/provider-entry.ts",
        "session/index": "src/session/index.ts",
        "storage/index": "src/storage/index.ts",
        "refresh/index": "src/refresh/index.ts",
        "authorization/index": "src/authorization/index.ts",
        "flows/index": "src/flows/index.ts",
        "test-provider/index": "src/test-provider/index.ts",
    },
    external: ["@sometic/core", "@sometic/core/error", "@sometic/core/id"],
});
