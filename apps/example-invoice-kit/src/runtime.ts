import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createSometicApp, type SometicApp } from "@sometic/app-shell";
import {
    createDraftController,
    createMemoryDraftStorage,
    type DraftController,
} from "@sometic/drafts";
import { createFeatureFlagController, type FeatureFlagController } from "@sometic/feature-flags";
import type { AuthController } from "@sometic/auth";
import { createInvoiceDeskApi, type InvoiceDeskApi } from "./api.js";
import {
    emptyInvoiceFormValues,
    INVOICE_DESK_USERS,
    INVOICE_NOTES_FLAG,
    type InvoiceFormValues,
} from "./model.js";

export type InvoiceDeskRuntime = {
    app: SometicApp;
    auth: AuthController;
    flags: FeatureFlagController;
    drafts: DraftController<InvoiceFormValues>;
    api: InvoiceDeskApi;
    editorValues: { current: InvoiceFormValues };
    dispose: () => void;
};

export function createInvoiceDeskRuntime(options: { now?: () => number } = {}): InvoiceDeskRuntime {
    const api = createInvoiceDeskApi({
        ...(options.now === undefined ? {} : { now: options.now }),
    });
    const editorValues = { current: emptyInvoiceFormValues() };
    const drafts = createDraftController<InvoiceFormValues>({
        key: "invoice:editor",
        version: 1,
        storage: createMemoryDraftStorage(),
        getValues: () => editorValues.current,
        setValues: (next) => {
            editorValues.current = next;
        },
    });
    const flags = createFeatureFlagController({
        flags: [{ key: INVOICE_NOTES_FLAG, defaultValue: true }],
    });
    const auth = createAuth({
        provider: createTestAuthProvider({
            users: INVOICE_DESK_USERS.map((entry) => ({
                email: entry.email,
                password: entry.password,
                user: {
                    id: entry.user.id,
                    email: entry.user.email,
                    displayName: entry.user.displayName,
                    roles: [...entry.user.roles],
                    permissions: [...entry.user.permissions],
                },
            })),
        }),
        storage: createMemoryAuthStorage(),
        environment: false,
        crossTab: false,
    });
    const app = createSometicApp({
        auth,
        baseUrl: "https://invoice.example",
        query: true,
        theme: true,
        flags,
        drafts: { controllers: [drafts], clearOnEpoch: true },
        createHttpOptions: {
            fetcher: api.fetcher,
            retry: false,
        },
    });
    return {
        app,
        auth,
        flags,
        drafts,
        api,
        editorValues,
        dispose: () => {
            app.dispose();
            auth.dispose();
            flags.dispose();
            drafts.dispose();
            api.dispose();
        },
    };
}
