import js from "@eslint/js";
import tseslint from "typescript-eslint";
import noImplementationComments from "./rules/no-implementation-comments.js";

const someticPlugin = {
    rules: {
        "no-implementation-comments": noImplementationComments,
    },
};

export function createPackageConfig(options = {}) {
    return tseslint.config(
        {
            ignores: [
                "**/dist/**",
                "**/coverage/**",
                "**/.turbo/**",
                "**/.vitepress/**",
                "**/eslint.config.js",
                "**/tsup.config.ts",
                "**/vitest.config.ts",
            ],
        },
        js.configs.recommended,
        ...tseslint.configs.recommended,
        {
            files: ["**/*.{ts,tsx,mts,cts}"],
            plugins: {
                sometic: someticPlugin,
            },
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: options.tsconfigRootDir,
                },
            },
            rules: {
                "sometic/no-implementation-comments": "error",
                "@typescript-eslint/consistent-type-imports": [
                    "error",
                    { prefer: "type-imports", fixStyle: "separate-type-imports" },
                ],
                "@typescript-eslint/no-explicit-any": "error",
                "@typescript-eslint/no-unused-vars": [
                    "error",
                    {
                        argsIgnorePattern: "^_",
                        varsIgnorePattern: "^_",
                    },
                ],
                "no-warning-comments": [
                    "error",
                    { terms: ["todo", "fixme", "xxx", "hack"], location: "anywhere" },
                ],
            },
        },
        {
            files: ["**/*.{js,mjs,cjs}"],
            ...tseslint.configs.disableTypeChecked,
            rules: {
                "sometic/no-implementation-comments": "off",
            },
        },
    );
}
