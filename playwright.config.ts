import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    use: {
        baseURL: "http://127.0.0.1:5180",
        trace: "on-first-retry",
    },
    webServer: {
        command: "pnpm --filter @sometic/docs exec vitepress preview --host 127.0.0.1 --port 5180",
        url: "http://127.0.0.1:5180",
        reuseExistingServer: false,
        timeout: 120000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
