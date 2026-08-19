import { describe, expect, it } from "vitest";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
} from "@sometic/auth";
import { createForm, createDraftController, createMemoryDraftStorage } from "@sometic/forms";
import { createHeadController } from "@sometic/head";
import { createMutationObserver, createQueryClient } from "@sometic/query";
import { createSessionStore } from "@sometic/store/kinds";
import { createThemeController } from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";
import { bindAuthToStores, bindThemeToHead } from "./bind-theme-stores.js";
import { bindMutationForm } from "./bind-mutation-form.js";
import { createAppShell } from "./create-app-shell.js";
import { createSometicApp } from "./create-sometic-app.js";

describe("createSometicApp", () => {
    it("exposes whenReauth, query.define, and query.invalidate over the shell", async () => {
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        const app = createSometicApp({
            auth,
            baseUrl: "https://api.example.com",
            createHttpOptions: {
                fetcher: async () =>
                    new Response(JSON.stringify({ ok: true }), {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    }),
            },
        });

        let epochs = 0;
        const stop = app.whenReauth(() => {
            epochs += 1;
        });

        const observer = app.query.define(["demo"], async () => {
            const response = await app.http.get<{ ok: boolean }>("/demo");
            return response.data;
        });
        await observer.refetch();
        expect(observer.getCurrentResult().data).toEqual({ ok: true });

        await app.query.invalidate(["demo"]);
        expect(app.query.getQueryState(["demo"])?.isInvalidated).toBe(true);

        await auth.signIn({ email: "demo@example.com", password: "password" });
        expect(epochs).toBeGreaterThan(0);

        stop();
        observer.destroy();
        app.dispose();
        app.dispose();
        await expect(app.http.get("/demo")).rejects.toMatchObject({ code: "HTTP_DISPOSED" });
        auth.dispose();
    });
});

describe("createAppShell", () => {
    it("clears query cache when session epoch bumps", async () => {
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        const query = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const shell = createAppShell({ auth, query });
        await query.fetchQuery({
            queryKey: ["private"],
            queryFn: async () => ({ secret: true }),
        });
        expect(query.getQueryData(["private"])).toEqual({ secret: true });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        expect(query.getQueryData(["private"])).toBeUndefined();
        await query.fetchQuery({
            queryKey: ["private"],
            queryFn: async () => ({ secret: true }),
        });
        const epoch = shell.getEpoch();
        await auth.signOut();
        expect(shell.getEpoch()).toBeGreaterThan(epoch);
        expect(query.getQueryData(["private"])).toBeUndefined();
        shell.dispose();
        auth.dispose();
    });

    it("bindThemeToHead syncs color-scheme attrs", () => {
        const head = createHeadController();
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "light",
        });
        const bind = bindThemeToHead(theme, head, { patchId: "theme" });
        expect(head.get().htmlAttrs?.["data-color-scheme"]).toBe("light");
        theme.setMode("dark");
        expect(head.get().htmlAttrs?.["data-color-scheme"]).toBe("dark");
        bind.dispose();
        expect(head.get().htmlAttrs?.["data-color-scheme"]).toBeUndefined();
        theme.dispose();
        head.dispose();
    });

    it("bindAuthToStores resets session store on epoch bump", async () => {
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        const session = createSessionStore({ note: "alive" });
        const stop = bindAuthToStores(auth, {
            sessionStores: [session],
            resetSessionState: { note: "" },
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        expect(session.get()).toEqual({ note: "" });
        session.set({ note: "again" });
        await auth.signOut();
        expect(session.get()).toEqual({ note: "" });
        stop();
        auth.dispose();
        session.dispose();
    });

    it("bindMutationForm maps success and clears draft", async () => {
        const query = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const form = createForm({ defaultValues: { title: "Hi", secret: "x" } });
        const storage = createMemoryDraftStorage();
        const draft = createDraftController({
            key: "t",
            version: 1,
            storage,
            getValues: () => form.getValues(),
            setValues: (values) => {
                form.setValue("title", values.title);
                form.setValue("secret", values.secret);
            },
            omit: ["secret"],
            debounceMs: 0,
        });
        await draft.save();
        expect(await storage.getItem("t")).not.toContain("secret");
        const mutation = createMutationObserver(query, {
            mutationFn: async (variables: { title: string }) => variables,
        });
        const bound = bindMutationForm({
            form,
            mutation,
            clearDraftOnSuccess: draft,
            getVariables: () => ({ title: String(form.getValues().title) }),
        });
        const result = await bound.submit();
        expect(result).toEqual({ title: "Hi" });
        expect(await storage.getItem("t")).toBeNull();
        bound.dispose();
        mutation.destroy();
        draft.dispose();
        form.dispose();
        query.dispose();
    });
});
