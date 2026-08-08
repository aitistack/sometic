import { createTsupConfig } from "@sometic/build-config";

export default createTsupConfig({
    entry: { index: "src/index.ts" },
    external: [
        "@sometic/auth",
        "@sometic/core",
        "@sometic/core/error",
        "firebase",
        "@supabase/supabase-js",
    ],
});
