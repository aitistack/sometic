import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "classes/index": "src/classes/index.ts",
        "styles/index": "src/styles/index.ts",
        "slots/index": "src/slots/index.ts",
        "state/index": "src/state/index.ts",
        "polymorphic/index": "src/polymorphic/index.ts",
    },
});
