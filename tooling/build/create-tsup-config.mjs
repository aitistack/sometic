export function createTsupConfig(options = {}) {
    return {
        entry: options.entry ?? ["src/index.ts"],
        format: ["esm"],
        dts: true,
        sourcemap: true,
        clean: true,
        treeshake: true,
        splitting: false,
        minify: false,
        target: "es2022",
        outDir: "dist",
        external: options.external ?? [],
        ...options,
    };
}
