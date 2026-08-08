import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: {
        index: "src/index.ts",
        "focus/index": "src/focus/index.ts",
        "keyboard/index": "src/keyboard/index.ts",
        "dismissable/index": "src/dismissable/index.ts",
        "portal/index": "src/portal/index.ts",
        "scroll-lock/index": "src/scroll-lock/index.ts",
        "announcer/index": "src/announcer/index.ts",
        "observers/index": "src/observers/index.ts",
    },
    external: ["@sometic/core", "@sometic/core/disposable", "@sometic/core/environment"],
});
