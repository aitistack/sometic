import { expect, test } from "@playwright/test";

test("docs home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: "Sometic" }).first()).toBeVisible();
    await expect(
        page
            .getByText("One behavior model for UI, forms, auth, HTTP, query, stores, and theming")
            .first(),
    ).toBeVisible();
});

test("quick start page loads", async ({ page }) => {
    await page.goto("/guide/quick-start");
    await expect(page.getByRole("heading", { name: "Quick start" })).toBeVisible();
    await expect(page.getByText("pnpm").first()).toBeVisible();
});
