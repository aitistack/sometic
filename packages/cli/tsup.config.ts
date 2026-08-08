import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        bin: "src/bin.ts",
    },
    external: [
        "@sometic/registry",
        "node:fs",
        "node:path",
        "node:path/posix",
        "node:os",
        "node:crypto",
    ],
});
