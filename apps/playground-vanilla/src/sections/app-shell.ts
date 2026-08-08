import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
} from "@sometic/auth";
import { bindMutationForm, createAppShell } from "@sometic/app-shell";
import {
    createDraftController,
    createForm,
    createMemoryDraftStorage,
} from "@sometic/forms";
import { applyHead, createHeadController } from "@sometic/head";
import { createMutationObserver, createQueryClient, createQueryObserver } from "@sometic/query";
import { createSessionStore } from "@sometic/store/kinds";
import { applyThemeToElement, createThemeController } from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";

type Item = { id: number; title: string };
type DraftValues = { title: string; secret: string };

const ITEMS_KEY = ["shell-items"] as const;

export function mountAppShellSection(root: HTMLElement): () => void {
    const epochEl = root.querySelector<HTMLElement>("[data-shell-epoch]");
    const listEl = root.querySelector<HTMLElement>("[data-shell-list]");
    const statusEl = root.querySelector<HTMLElement>("[data-shell-status]");
    const draftEl = root.querySelector<HTMLElement>("[data-shell-draft]");
    const titleInput = root.querySelector<HTMLInputElement>("[data-shell-title]");
    const secretInput = root.querySelector<HTMLInputElement>("[data-shell-secret]");
    const schemeEl = root.querySelector<HTMLElement>("[data-shell-scheme]");

    if (!epochEl || !listEl || !statusEl || !draftEl || !titleInput || !secretInput || !schemeEl) {
        throw new Error("App shell section nodes missing");
    }

    let serverItems: Item[] = [
        { id: 1, title: "Privileged Alpha" },
        { id: 2, title: "Privileged Beta" },
    ];
    let nextId = 3;

    const auth = createAuth({
        provider: createTestAuthProvider(),
        storage: createMemoryAuthStorage(),
        crossTab: createNoopAuthBus(),
        environment: false,
    });
    const query = createQueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0 } },
    });
    const head = createHeadController({ initial: { title: "Playground" } });
    const theme = createThemeController({
        themes: [lightTheme, darkTheme],
        defaultThemeId: "light",
        darkThemeId: "dark",
        mode: "light",
    });
    const sessionStore = createSessionStore({ note: "session-only" });

    const shell = createAppShell({
        auth,
        query,
        head,
        theme,
        stores: { session: sessionStore },
        resetSessionState: { note: "" },
        refetchOnReauth: "all",
    });

    const stopHead = head.subscribe(() => {
        applyHead(document, head.get());
        const snap = head.get();
        schemeEl.textContent =
            snap.htmlAttrs?.["data-color-scheme"] ??
            snap.htmlAttrs?.style ??
            "(no scheme attrs yet)";
    });
    const stopTheme = theme.subscribe(() => {
        applyThemeToElement(document.documentElement, theme.get());
    });
    applyThemeToElement(document.documentElement, theme.get());

    const observer = createQueryObserver<Item[]>(query, {
        queryKey: ITEMS_KEY,
        queryFn: async () => serverItems.map((item) => ({ ...item })),
    });

    const renderList = (): void => {
        const result = observer.getCurrentResult();
        listEl.replaceChildren();
        if (result.isPending) {
            const li = document.createElement("li");
            li.textContent = "Loading…";
            listEl.appendChild(li);
            return;
        }
        if (!result.data || result.data.length === 0) {
            const li = document.createElement("li");
            li.textContent = "(cache empty)";
            listEl.appendChild(li);
            return;
        }
        for (const item of result.data) {
            const li = document.createElement("li");
            li.textContent = `${item.id}: ${item.title}`;
            listEl.appendChild(li);
        }
    };

    const stopQuery = observer.subscribe(() => {
        renderList();
    });

    const form = createForm<DraftValues>({
        defaultValues: { title: "", secret: "" },
    });
    const draftStorage = createMemoryDraftStorage();
    const draft = createDraftController<DraftValues>({
        key: "shell-demo",
        version: 1,
        storage: draftStorage,
        getValues: () => form.getValues(),
        setValues: (values) => {
            form.setValue("title", values.title);
            form.setValue("secret", values.secret);
        },
        omit: ["secret"],
        debounceMs: 0,
    });

    const mutation = createMutationObserver(query, {
        mutationFn: async (variables: { title: string }) => {
            const item = { id: nextId++, title: variables.title };
            serverItems = [...serverItems, item];
            return item;
        },
        invalidateKeys: [ITEMS_KEY],
    });

    const bound = bindMutationForm({
        form,
        mutation,
        getEpoch: () => auth.getEpoch(),
        queryClient: query,
        invalidateKeys: [ITEMS_KEY],
        clearDraftOnSuccess: draft,
        getVariables: () => ({ title: String(form.getValues().title ?? "") }),
        mapError: () => [],
    });

    const syncEpoch = (): void => {
        epochEl.textContent = String(shell.getEpoch());
    };
    const stopEpoch = shell.onEpochChange(() => {
        syncEpoch();
        statusEl.textContent = `Epoch → ${shell.getEpoch()} (query cleared)`;
        renderList();
    });
    syncEpoch();
    statusEl.textContent = "Ready — sign in loads cache; sign out clears it";

    const onSignIn = (): void => {
        void auth.signIn({ email: "demo@example.com", password: "password" }).then(() => {
            statusEl.textContent = "Signed in";
            void observer.refetch();
        });
    };
    const onSignOut = (): void => {
        void auth.signOut().then(() => {
            statusEl.textContent = "Signed out — privileged cache cleared";
            renderList();
        });
    };
    const onThemeLight = (): void => {
        theme.setMode("light");
        statusEl.textContent = "Theme light → head color-scheme synced";
    };
    const onThemeDark = (): void => {
        theme.setMode("dark");
        statusEl.textContent = "Theme dark → head color-scheme synced";
    };
    const onSaveDraft = (): void => {
        form.setValue("title", titleInput.value);
        form.setValue("secret", secretInput.value);
        void draft.save().then(async () => {
            const raw = await draftStorage.getItem("shell-demo");
            draftEl.textContent = raw ?? "(empty)";
            statusEl.textContent = "Draft saved (secret omitted)";
        });
    };
    const onSubmit = (): void => {
        form.setValue("title", titleInput.value);
        form.setValue("secret", secretInput.value);
        void bound
            .submit()
            .then(() => {
                titleInput.value = "";
                statusEl.textContent = "Mutation form submit ok";
            })
            .catch((error: Error) => {
                statusEl.textContent = error.message;
            });
    };

    root.querySelector("[data-shell-signin]")?.addEventListener("click", onSignIn);
    root.querySelector("[data-shell-signout]")?.addEventListener("click", onSignOut);
    root.querySelector("[data-shell-theme-light]")?.addEventListener("click", onThemeLight);
    root.querySelector("[data-shell-theme-dark]")?.addEventListener("click", onThemeDark);
    root.querySelector("[data-shell-draft-save]")?.addEventListener("click", onSaveDraft);
    root.querySelector("[data-shell-submit]")?.addEventListener("click", onSubmit);

    return () => {
        root.querySelector("[data-shell-signin]")?.removeEventListener("click", onSignIn);
        root.querySelector("[data-shell-signout]")?.removeEventListener("click", onSignOut);
        root.querySelector("[data-shell-theme-light]")?.removeEventListener("click", onThemeLight);
        root.querySelector("[data-shell-theme-dark]")?.removeEventListener("click", onThemeDark);
        root.querySelector("[data-shell-draft-save]")?.removeEventListener("click", onSaveDraft);
        root.querySelector("[data-shell-submit]")?.removeEventListener("click", onSubmit);
        stopEpoch();
        stopQuery();
        stopHead();
        stopTheme();
        observer.destroy();
        mutation.destroy();
        draft.dispose();
        form.dispose();
        bound.dispose();
        shell.dispose();
        auth.dispose();
    };
}
