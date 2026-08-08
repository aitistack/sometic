import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: { index: "src/index.ts" },
    external: ["@sometic/adapter-contract", "@sometic/store", "@sometic/core", "@angular/core"],
});
