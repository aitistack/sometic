import { expect, test, type Page } from "@playwright/test";

const ada = { email: "ada@invoice.example", password: "invoice-desk" };
const ben = { email: "ben@invoice.example", password: "invoice-desk" };

async function signIn(page: Page, account: { email: string; password: string }): Promise<void> {
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

test("login, create invoice, and scope rows after sign-out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Invoice Desk" })).toBeVisible();
    await signIn(page, ada);
    await expect(page.getByText("Northwind").first()).toBeVisible();
    await expect(page.getByText("Contoso").first()).toBeVisible();
    await expect(page.getByText("Fabrikam")).toHaveCount(0);

    await page.getByLabel("Customer").fill("Orchard Labs");
    await page.getByLabel("Amount").fill("120");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Orchard Labs").first()).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByLabel("Email")).toBeVisible();

    await signIn(page, ben);
    await expect(page.getByText("Fabrikam")).toBeVisible();
    await expect(page.getByText("Northwind")).toHaveCount(0);
    await expect(page.getByText("Orchard Labs")).toHaveCount(0);
});

test("login controls are named and keyboard submit focuses the email after an error", async ({
    page,
}) => {
    await page.goto("/");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await page.getByLabel("Email").fill(ada.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByLabel("Password").press("Enter");
    await expect(page.getByRole("alert")).toContainText("Invalid email or password");
    await expect(page.getByLabel("Email")).toBeFocused();
});

test("editor controls are named and the first invalid field is focused", async ({ page }) => {
    await page.goto("/");
    await signIn(page, ada);
    await expect(page.getByLabel("Customer")).toBeVisible();
    await expect(page.getByLabel("Amount")).toBeVisible();
    await expect(page.getByLabel("Status")).toBeVisible();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByLabel("Customer")).toBeFocused();
});
