import { defineConfig, devices } from "@playwright/test";

const chromium = devices["Desktop Chrome"];

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    use: {
        trace: "on-first-retry",
    },
    webServer: [
        {
            command:
                "pnpm --filter @sometic/docs exec vitepress preview --host 127.0.0.1 --port 5180",
            url: "http://127.0.0.1:5180",
            reuseExistingServer: !process.env.CI,
            timeout: 180000,
        },
        // Parked: Invoice Desk example apps. Restore with docs launch. See .cursor/context/examples-paused.md
        // {
        //     command: "pnpm --filter @sometic/example-invoice-react preview",
        //     url: "http://127.0.0.1:5210",
        //     reuseExistingServer: !process.env.CI,
        //     timeout: 180000,
        // },
        // {
        //     command: "pnpm --filter @sometic/example-invoice-vue preview",
        //     url: "http://127.0.0.1:5211",
        //     reuseExistingServer: !process.env.CI,
        //     timeout: 180000,
        // },
        // {
        //     command: "pnpm --filter @sometic/example-invoice-vanilla preview",
        //     url: "http://127.0.0.1:5212",
        //     reuseExistingServer: !process.env.CI,
        //     timeout: 180000,
        // },
    ],
    projects: [
        {
            name: "docs",
            use: { ...chromium, baseURL: "http://127.0.0.1:5180" },
            testMatch: /docs-smoke\.spec\.ts/,
        },
        // Parked: Invoice Desk example journeys. Restore with docs launch.
        // {
        //     name: "example-invoice-react",
        //     use: { ...chromium, baseURL: "http://127.0.0.1:5210" },
        //     testMatch: /example-invoice\.spec.ts/,
        // },
        // {
        //     name: "example-invoice-vue",
        //     use: { ...chromium, baseURL: "http://127.0.0.1:5211" },
        //     testMatch: /example-invoice\.spec.ts/,
        // },
        // {
        //     name: "example-invoice-vanilla",
        //     use: { ...chromium, baseURL: "http://127.0.0.1:5212" },
        //     testMatch: /example-invoice\.spec.ts/,
        // },
    ],
});
