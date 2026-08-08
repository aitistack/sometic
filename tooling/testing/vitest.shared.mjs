import { defineConfig } from "vitest/config";

export function createVitestConfig(options = {}) {
    return defineConfig({
        test: {
            environment: "node",
            include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
            coverage: {
                provider: "v8",
                reporter: ["text", "json-summary", "html"],
                include: ["src/**/*.ts"],
                exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
            },
            ...options.test,
        },
        ...options,
    });
}
