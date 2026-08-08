import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "keys/index": "src/keys/index.ts",
        "http/index": "src/http/index.ts",
    },
    external: ["@sometic/core", "@sometic/http"],
});
