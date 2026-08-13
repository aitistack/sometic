import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        "sometic-positioning": "src/cdn.ts",
    },
    format: ["esm", "iife"],
    outDir: "dist/cdn",
    globalName: "SometicPositioning",
    dts: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
    minify: true,
    target: "es2022",
    external: [],
    noExternal: [/^@sometic\//],
    outExtension({ format }) {
        return {
            js: format === "iife" ? ".iife.js" : ".esm.js",
        };
    },
});
