import {
    createSeedInvoices,
    parseAccessTokenUserId,
    parseInvoiceStatus,
    type Invoice,
    type InvoiceWriteInput,
} from "./model.js";

export type InvoiceDeskApi = {
    fetcher: typeof fetch;
    listForOwner: (ownerId: string) => Invoice[];
    reset: () => void;
    dispose: () => void;
    readonly disposed: boolean;
};

function headerValue(headers: HeadersInit | undefined, name: string): string {
    if (headers === undefined) {
        return "";
    }
    const bag = new Headers(headers);
    return bag.get(name) ?? "";
}

function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function readWriteInput(init: RequestInit | undefined): Promise<InvoiceWriteInput | null> {
    const raw = init?.body;
    if (typeof raw !== "string") {
        return null;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        return null;
    }
    if (parsed === null || typeof parsed !== "object") {
        return null;
    }
    const record = parsed as Record<string, unknown>;
    const customer = record["customer"];
    const amount = record["amount"];
    const status = record["status"];
    const notes = record["notes"];
    if (typeof customer !== "string" || typeof amount !== "number" || typeof status !== "string") {
        return null;
    }
    const parsedStatus = parseInvoiceStatus(status);
    if (parsedStatus === null) {
        return null;
    }
    return {
        customer,
        amount,
        status: parsedStatus,
        notes: typeof notes === "string" ? notes : "",
    };
}

export function createInvoiceDeskApi(options: { now?: () => number } = {}): InvoiceDeskApi {
    const now = options.now ?? Date.now;
    const invoices = new Map<string, Invoice>();
    let sequence = 0;
    let disposed = false;

    const seed = (): void => {
        invoices.clear();
        sequence = 0;
        for (const invoice of createSeedInvoices(now())) {
            invoices.set(invoice.id, invoice);
            sequence += 1;
        }
    };

    seed();

    const fetcher: typeof fetch = async (input, init) => {
        if (disposed) {
            return jsonResponse(500, { error: "disposed" });
        }
        const url =
            typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const method = (init?.method ?? "GET").toUpperCase();
        const path = new URL(url, "https://invoice.example").pathname.replace(/\/$/, "") || "/";
        const userId = parseAccessTokenUserId(headerValue(init?.headers, "Authorization"));
        if (userId === null) {
            return jsonResponse(401, { error: "unauthorized" });
        }

        if (method === "GET" && path === "/invoices") {
            return jsonResponse(
                200,
                [...invoices.values()].filter((invoice) => invoice.ownerId === userId),
            );
        }

        const itemMatch = /^\/invoices\/([^/]+)$/.exec(path);
        const invoiceId = itemMatch?.[1];

        if (method === "GET" && invoiceId !== undefined) {
            const invoice = invoices.get(invoiceId);
            if (invoice === undefined || invoice.ownerId !== userId) {
                return jsonResponse(404, { error: "not-found" });
            }
            return jsonResponse(200, invoice);
        }

        if (method === "POST" && path === "/invoices") {
            const body = await readWriteInput(init);
            if (body === null) {
                return jsonResponse(400, { error: "invalid-body" });
            }
            sequence += 1;
            const created: Invoice = {
                id: `inv-${userId}-${sequence}`,
                ownerId: userId,
                number: `INV-${1000 + sequence}`,
                customer: body.customer,
                amount: body.amount,
                status: body.status,
                notes: body.notes,
                updatedAt: now(),
            };
            invoices.set(created.id, created);
            return jsonResponse(201, created);
        }

        if (method === "PUT" && invoiceId !== undefined) {
            const existing = invoices.get(invoiceId);
            if (existing === undefined || existing.ownerId !== userId) {
                return jsonResponse(404, { error: "not-found" });
            }
            const body = await readWriteInput(init);
            if (body === null) {
                return jsonResponse(400, { error: "invalid-body" });
            }
            const updated: Invoice = {
                ...existing,
                customer: body.customer,
                amount: body.amount,
                status: body.status,
                notes: body.notes,
                updatedAt: now(),
            };
            invoices.set(updated.id, updated);
            return jsonResponse(200, updated);
        }

        return jsonResponse(404, { error: "unhandled" });
    };

    return {
        fetcher,
        listForOwner: (ownerId) =>
            [...invoices.values()].filter((invoice) => invoice.ownerId === ownerId),
        reset: seed,
        dispose: () => {
            disposed = true;
            invoices.clear();
        },
        get disposed() {
            return disposed;
        },
    };
}
