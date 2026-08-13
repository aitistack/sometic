import { createCommandRegistry } from "@sometic/commands";
import {
    createConflictController,
    clientWinsStrategy,
    serverWinsStrategy,
} from "@sometic/conflict";
import {
    createDraftController,
    createMemoryDraftStorage,
} from "@sometic/drafts";
import { createFeatureFlagController } from "@sometic/feature-flags";
import { createHistoryController } from "@sometic/history";
import {
    createMemoryOfflineQueueStorage,
    createOfflineMutationQueue,
} from "@sometic/offline-queue";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createPermissionController,
    createTestAuthProvider,
} from "@sometic/auth";

export function mountAppPrimitivesSection(root: HTMLElement): () => void {
    const section = root.querySelector("#app-primitives");
    if (!(section instanceof HTMLElement)) {
        return () => {};
    }

    const flagStatus = section.querySelector("[data-ap-flags-status]");
    const draftInput = section.querySelector("[data-ap-draft-input]");
    const draftStatus = section.querySelector("[data-ap-draft-status]");
    const commandStatus = section.querySelector("[data-ap-command-status]");
    const historyValue = section.querySelector("[data-ap-history-value]");
    const historyStatus = section.querySelector("[data-ap-history-status]");
    const conflictStatus = section.querySelector("[data-ap-conflict-status]");
    const offlineStatus = section.querySelector("[data-ap-offline-status]");
    const permissionStatus = section.querySelector("[data-ap-permission-status]");

    const flags = createFeatureFlagController({
        flags: [
            {
                key: "demo.beta",
                defaultValue: false,
                defaultVariant: "control",
                description: "Playground beta surface",
            },
        ],
    });

    let draftValues = { title: "" };
    const drafts = createDraftController({
        key: "playground:note",
        version: 1,
        storage: createMemoryDraftStorage(),
        getValues: () => draftValues,
        setValues: (next) => {
            draftValues = next;
            if (draftInput instanceof HTMLInputElement) {
                draftInput.value = next.title;
            }
        },
    });

    const commands = createCommandRegistry();
    commands.register({
        id: "demo.ping",
        label: "Ping",
        execute: () => {
            if (commandStatus instanceof HTMLElement) {
                commandStatus.textContent = `Executed demo.ping at ${new Date().toLocaleTimeString()}`;
            }
            return "pong";
        },
    });

    let counter = 0;
    const history = createHistoryController({ maxDepth: 20 });
    const renderHistory = (): void => {
        if (historyValue instanceof HTMLElement) {
            historyValue.textContent = String(counter);
        }
        if (historyStatus instanceof HTMLElement) {
            const state = history.getState();
            historyStatus.textContent = `undo ${String(state.undoDepth)} · redo ${String(state.redoDepth)}`;
        }
    };

    const conflicts = createConflictController({
        defaultStrategyId: clientWinsStrategy.id,
    });
    let openConflictId: string | null = null;
    const renderConflict = (): void => {
        if (!(conflictStatus instanceof HTMLElement)) {
            return;
        }
        if (!openConflictId) {
            conflictStatus.textContent = "No open conflict";
            return;
        }
        const record = conflicts.get(openConflictId);
        if (!record) {
            conflictStatus.textContent = "Conflict missing";
            return;
        }
        conflictStatus.textContent =
            record.status === "resolved"
                ? `Resolved (${String(record.strategyId ?? "manual")}): ${JSON.stringify(record.resolution)}`
                : `Open local=${JSON.stringify(record.local)} remote=${JSON.stringify(record.remote)}`;
    };

    const offline = createOfflineMutationQueue({
        storage: createMemoryOfflineQueueStorage(),
        transport: {
            send: async (job) => {
                await Promise.resolve();
                return job.variables;
            },
        },
        maxAttempts: 3,
    });
    const renderOffline = (): void => {
        if (!(offlineStatus instanceof HTMLElement)) {
            return;
        }
        const jobs = offline.peek();
        offlineStatus.textContent =
            jobs.length === 0
                ? "Queue empty"
                : jobs
                      .map((job) => `${job.key} (${job.status}, attempts=${String(job.attempts)})`)
                      .join(" · ");
    };

    const auth = createAuth({
        provider: createTestAuthProvider(),
        storage: createMemoryAuthStorage(),
        crossTab: createNoopAuthBus(),
        environment: false,
    });
    const permissions = createPermissionController({ auth });
    const renderPermission = (): void => {
        if (!(permissionStatus instanceof HTMLElement)) {
            return;
        }
        const canEdit = permissions.can({
            permission: "docs:edit",
            resource: "doc-1",
        });
        const canProfile = permissions.can("read:profile");
        permissionStatus.textContent = `docs:edit@doc-1=${String(canEdit)} · read:profile=${String(canProfile)}`;
    };

    const unsubs = [
        flags.subscribe((snapshots) => {
            const demo = snapshots.find((item) => item.key === "demo.beta");
            if (flagStatus instanceof HTMLElement && demo) {
                flagStatus.textContent = `demo.beta enabled=${String(demo.enabled)} source=${demo.source} variant=${String(demo.variant)}`;
            }
        }),
        history.subscribe(() => {
            renderHistory();
        }),
        conflicts.subscribe(() => {
            renderConflict();
        }),
        offline.subscribe(() => {
            renderOffline();
        }),
        permissions.subscribe(() => {
            renderPermission();
        }),
    ];

    const onClick = (selector: string, handler: () => void | Promise<void>): void => {
        const button = section.querySelector(selector);
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        button.addEventListener("click", () => {
            void handler();
        });
    };

    onClick("[data-ap-flag-enable]", () => {
        flags.setOverride("demo.beta", { enabled: true, variant: "treatment" });
    });
    onClick("[data-ap-flag-disable]", () => {
        flags.setOverride("demo.beta", { enabled: false, variant: "control" });
    });
    onClick("[data-ap-flag-clear]", () => {
        flags.clearOverrides();
    });

    onClick("[data-ap-draft-save]", async () => {
        if (draftInput instanceof HTMLInputElement) {
            draftValues = { title: draftInput.value };
        }
        await drafts.save();
        if (draftStatus instanceof HTMLElement) {
            draftStatus.textContent = `Saved: ${JSON.stringify(draftValues)}`;
        }
    });
    onClick("[data-ap-draft-load]", async () => {
        const loaded = await drafts.load();
        if (draftStatus instanceof HTMLElement) {
            draftStatus.textContent =
                loaded === null ? "No draft stored" : `Loaded: ${JSON.stringify(loaded)}`;
        }
    });
    onClick("[data-ap-draft-clear]", async () => {
        await drafts.clear();
        draftValues = { title: "" };
        if (draftInput instanceof HTMLInputElement) {
            draftInput.value = "";
        }
        if (draftStatus instanceof HTMLElement) {
            draftStatus.textContent = "Draft cleared";
        }
    });

    onClick("[data-ap-command-run]", async () => {
        await commands.execute("demo.ping");
    });

    onClick("[data-ap-history-inc]", async () => {
        await history.execute({
            label: "Increment",
            execute: () => {
                const previous = counter;
                counter += 1;
                renderHistory();
                return previous;
            },
            undo: (previous) => {
                counter = previous;
                renderHistory();
            },
        });
    });
    onClick("[data-ap-history-undo]", async () => {
        if (!history.canUndo()) {
            return;
        }
        await history.undo();
    });
    onClick("[data-ap-history-redo]", async () => {
        if (!history.canRedo()) {
            return;
        }
        await history.redo();
    });

    onClick("[data-ap-conflict-open]", () => {
        const opened = conflicts.open({
            key: "invoice:demo",
            local: { total: 100 },
            remote: { total: 120 },
            localUpdatedAt: 1_000,
            remoteUpdatedAt: 2_000,
        });
        openConflictId = opened.id;
        renderConflict();
    });
    onClick("[data-ap-conflict-client]", () => {
        if (!openConflictId) {
            return;
        }
        conflicts.resolve(openConflictId, clientWinsStrategy.id);
    });
    onClick("[data-ap-conflict-server]", () => {
        if (!openConflictId) {
            return;
        }
        conflicts.resolve(openConflictId, serverWinsStrategy.id);
    });

    onClick("[data-ap-offline-enqueue]", async () => {
        await offline.enqueue({
            key: "note.save",
            variables: { title: draftValues.title || "untitled" },
        });
        renderOffline();
    });
    onClick("[data-ap-offline-flush]", async () => {
        await offline.flush();
        renderOffline();
    });

    onClick("[data-ap-permission-grant]", () => {
        permissions.grant({ permission: "docs:edit", resource: "doc-1" });
    });
    onClick("[data-ap-permission-revoke]", () => {
        permissions.revoke({ permission: "docs:edit", resource: "doc-1" });
    });
    onClick("[data-ap-permission-check]", () => {
        renderPermission();
    });

    void (async () => {
        await auth.signIn({ email: "demo@example.com", password: "password" });
        renderPermission();
    })();

    const demo = flags.getSnapshot("demo.beta");
    if (flagStatus instanceof HTMLElement) {
        flagStatus.textContent = `demo.beta enabled=${String(demo.enabled)} source=${demo.source} variant=${String(demo.variant)}`;
    }
    renderHistory();
    renderConflict();
    renderOffline();
    renderPermission();

    return () => {
        for (const stop of unsubs) {
            stop();
        }
        flags.dispose();
        drafts.dispose();
        commands.dispose();
        history.dispose();
        conflicts.dispose();
        offline.dispose();
        permissions.dispose();
        auth.dispose();
    };
}
