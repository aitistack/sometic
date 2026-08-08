import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "path/index": "src/path/index.ts",
        "validators/index": "src/validators/index.ts",
        "compose/index": "src/compose/index.ts",
        "schema/index": "src/schema/index.ts",
        "define/index": "src/define/index.ts",
    },
});
