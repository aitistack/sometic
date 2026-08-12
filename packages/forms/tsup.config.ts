import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "drafts/index": "src/drafts/index.ts",
        "steps/index": "src/steps/index.ts",
        "form-data/index": "src/form-data/index.ts",
        "a11y/index": "src/a11y/index.ts",
        feedback: "src/feedback.ts",
        "server/index": "src/server/index.ts",
        "schema-form/index": "src/schema-form/index.ts",
    },
    external: ["@sometic/core", "@sometic/validation", "@sometic/validation/path"],
});
