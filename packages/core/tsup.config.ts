import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "environment/index": "src/environment/index.ts",
        "id/index": "src/id/index.ts",
        "disposable/index": "src/disposable/index.ts",
        "error/index": "src/error/index.ts",
        "result/index": "src/result/index.ts",
        "contracts/index": "src/contracts/index.ts",
        "controllable-state/index": "src/controllable-state/index.ts",
        "async-operation/index": "src/async-operation/index.ts",
        "utils/index": "src/utils/index.ts",
    },
});
