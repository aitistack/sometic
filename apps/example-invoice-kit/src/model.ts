export type InvoiceStatus = "draft" | "sent" | "paid";

export type Invoice = {
    id: string;
    ownerId: string;
    number: string;
    customer: string;
    amount: number;
    status: InvoiceStatus;
    notes: string;
    updatedAt: number;
};

export type InvoiceFormValues = {
    customer: string;
    amount: string;
    status: string;
    notes: string;
};

export type InvoiceWriteInput = {
    customer: string;
    amount: number;
    status: InvoiceStatus;
    notes: string;
};

export const INVOICE_NOTES_FLAG = "invoices.notes";

export const INVOICE_DESK_PASSWORD = "invoice-desk";

export const INVOICE_DESK_USERS = [
    {
        email: "ada@invoice.example",
        password: INVOICE_DESK_PASSWORD,
        user: {
            id: "user-ada",
            email: "ada@invoice.example",
            displayName: "Ada",
            roles: ["user"],
            permissions: ["invoices:read", "invoices:write"],
        },
    },
    {
        email: "ben@invoice.example",
        password: INVOICE_DESK_PASSWORD,
        user: {
            id: "user-ben",
            email: "ben@invoice.example",
            displayName: "Ben",
            roles: ["user"],
            permissions: ["invoices:read", "invoices:write"],
        },
    },
] as const;

export function emptyInvoiceFormValues(): InvoiceFormValues {
    return {
        customer: "",
        amount: "",
        status: "draft",
        notes: "",
    };
}

export function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
    return {
        customer: invoice.customer,
        amount: String(invoice.amount),
        status: invoice.status,
        notes: invoice.notes,
    };
}

export function parseInvoiceStatus(value: string): InvoiceStatus | null {
    if (value === "draft" || value === "sent" || value === "paid") {
        return value;
    }
    return null;
}

export function parseAccessTokenUserId(authorization: string): string | null {
    const trimmed = authorization.trim();
    const token = trimmed.toLowerCase().startsWith("bearer ")
        ? trimmed.slice("bearer ".length).trim()
        : trimmed;
    const match = /^access-(.+)-(\d+)$/.exec(token);
    const userId = match?.[1];
    return userId === undefined || userId.length === 0 ? null : userId;
}

export function createSeedInvoices(now: number): Invoice[] {
    return [
        {
            id: "inv-ada-1",
            ownerId: "user-ada",
            number: "INV-1001",
            customer: "Northwind",
            amount: 250,
            status: "sent",
            notes: "Net 30",
            updatedAt: now,
        },
        {
            id: "inv-ada-2",
            ownerId: "user-ada",
            number: "INV-1002",
            customer: "Contoso",
            amount: 80,
            status: "draft",
            notes: "",
            updatedAt: now,
        },
        {
            id: "inv-ben-1",
            ownerId: "user-ben",
            number: "INV-2001",
            customer: "Fabrikam",
            amount: 400,
            status: "paid",
            notes: "Paid on receipt",
            updatedAt: now,
        },
    ];
}
