import { describe, expect, it } from "vitest";
import { createInvoiceDeskApi } from "./api.js";
import { emptyInvoiceFormValues, parseAccessTokenUserId, parseInvoiceStatus } from "./model.js";
import { createInvoiceDeskRuntime } from "./runtime.js";
import {
    invoiceAmountValidators,
    invoiceCustomerValidators,
    invoiceStatusValidators,
} from "./validators.js";
import { normalizeResult } from "@sometic/validation";

function token(userId: string): string {
    return `Bearer access-${userId}-1000`;
}

describe("parseAccessTokenUserId", () => {
    it("reads the user id from a test access token", () => {
        expect(parseAccessTokenUserId("Bearer access-user-ada-173000")).toBe("user-ada");
        expect(parseAccessTokenUserId("")).toBeNull();
    });
});

describe("createInvoiceDeskApi", () => {
    it("scopes list and create to the authenticated owner", async () => {
        const api = createInvoiceDeskApi({ now: () => 1 });
        const adaList = await api.fetcher("https://invoice.example/invoices", {
            headers: { Authorization: token("user-ada") },
        });
        const adaRows = (await adaList.json()) as Array<{ customer: string }>;
        expect(adaRows.map((row) => row.customer)).toEqual(["Northwind", "Contoso"]);

        const created = await api.fetcher("https://invoice.example/invoices", {
            method: "POST",
            headers: { Authorization: token("user-ada") },
            body: JSON.stringify({
                customer: "Orchard Labs",
                amount: 120,
                status: "draft",
                notes: "",
            }),
        });
        expect(created.status).toBe(201);
        expect(api.listForOwner("user-ada").some((row) => row.customer === "Orchard Labs")).toBe(
            true,
        );
        expect(api.listForOwner("user-ben").some((row) => row.customer === "Orchard Labs")).toBe(
            false,
        );
        api.dispose();
        expect(api.disposed).toBe(true);
    });

    it("returns 401 without a bearer token", async () => {
        const api = createInvoiceDeskApi();
        const response = await api.fetcher("https://invoice.example/invoices");
        expect(response.status).toBe(401);
        api.dispose();
    });
});

describe("invoice validators", () => {
    it("rejects empty customer and non-positive amount", () => {
        const customer = normalizeResult(
            invoiceCustomerValidators[0]?.("", { values: {}, path: "customer" }),
            "customer",
        );
        expect(customer.valid).toBe(false);
        const amount = normalizeResult(
            invoiceAmountValidators[1]?.("0", { values: {}, path: "amount" }),
            "amount",
        );
        expect(amount.valid).toBe(false);
        const status = normalizeResult(
            invoiceStatusValidators[1]?.("nope", { values: {}, path: "status" }),
            "status",
        );
        expect(status.valid).toBe(false);
        expect(parseInvoiceStatus("sent")).toBe("sent");
        expect(emptyInvoiceFormValues().status).toBe("draft");
    });
});

describe("createInvoiceDeskRuntime", () => {
    it("serves Ada invoices after sign-in and 401 after sign-out", async () => {
        const runtime = createInvoiceDeskRuntime({ now: () => 1 });
        await runtime.auth.signIn({
            email: "ada@invoice.example",
            password: "invoice-desk",
        });
        const listed = await runtime.app.http.get<Array<{ customer: string }>>("/invoices");
        expect(listed.data.map((row) => row.customer)).toEqual(["Northwind", "Contoso"]);
        await runtime.auth.signOut();
        await expect(runtime.app.http.get("/invoices")).rejects.toMatchObject({
            code: "HTTP_UNAUTHORIZED",
        });
        runtime.dispose();
        expect(runtime.api.disposed).toBe(true);
    });

    it("does not leak Ada invoices to Ben after a session switch", async () => {
        const runtime = createInvoiceDeskRuntime({ now: () => 1 });
        await runtime.auth.signIn({
            email: "ada@invoice.example",
            password: "invoice-desk",
        });
        await runtime.app.http.get("/invoices");
        await runtime.auth.signOut();
        await runtime.auth.signIn({
            email: "ben@invoice.example",
            password: "invoice-desk",
        });
        const listed = await runtime.app.http.get<Array<{ customer: string }>>("/invoices");
        expect(listed.data.map((row) => row.customer)).toEqual(["Fabrikam"]);
        runtime.dispose();
    });
});
