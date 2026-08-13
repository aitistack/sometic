import type { AuthController, PermissionController } from "@sometic/auth";
import type { CommandRegistry } from "@sometic/commands";
import type { DraftController } from "@sometic/drafts";
import type { FeatureFlagController } from "@sometic/feature-flags";
import type { FormController } from "@sometic/forms";
import type { DraftController as FormDraftController } from "@sometic/forms/drafts";
import type { HeadController } from "@sometic/head";
import type { HistoryController } from "@sometic/history";
import type { CreateHttpOptions, HttpClient } from "@sometic/http";
import type { OfflineMutationQueue } from "@sometic/offline-queue";
import {
    createQueryClient,
    type CreateQueryClientOptions,
    type QueryClient,
    type QueryKey,
} from "@sometic/query";
import type { ThemeController } from "@sometic/theme";
import { bindAuthToHttp } from "./bind-http.js";
import { bindHeadToQuery } from "./bind-head-query.js";
import { bindMutationForm } from "./bind-mutation-form.js";
import { bindQueryToAuth, type RefetchOnReauth } from "./bind-query.js";
import { bindAuthToStores, bindThemeToHead } from "./bind-theme-stores.js";
import {
    bindMutationQueueToAuth,
    createSessionMutationQueue,
    type SessionMutationQueue,
} from "./mutation-queue.js";

export type AppShellStores = {
    ui?: { dispose?: () => void };
    prefs?: { dispose?: () => void; clearPersisted?: () => Promise<void> };
    session?: {
        dispose?: () => void;
        get?: () => unknown;
        set?: (state: never) => void;
        clearPersisted?: () => Promise<void>;
    };
};

export type CreateAppShellOptions = {
    auth: AuthController;
    http?: HttpClient;
    createHttpOptions?: CreateHttpOptions;
    allowAbsoluteUrl?: boolean;
    maxResponseBytes?: number;
    query?: QueryClient;
    createQueryOptions?: CreateQueryClientOptions;
    head?: HeadController;
    theme?: ThemeController;
    stores?: AppShellStores;
    forms?: {
        draftsClearOnEpoch?: boolean;
        register?: FormController<Record<string, unknown>>[];
        draftControllers?: FormDraftController<Record<string, unknown>>[];
    };
    flags?: FeatureFlagController;
    drafts?: {
        controllers?: DraftController<unknown>[];
        clearOnEpoch?: boolean;
    };
    commands?: CommandRegistry;
    history?: HistoryController;
    offlineQueue?: OfflineMutationQueue;
    permissions?: PermissionController;
    refetchOnReauth?: RefetchOnReauth;
    authQueryKeys?: readonly QueryKey[];
    require?: Parameters<typeof bindAuthToHttp>[0]["require"];
    resetSessionState?: unknown;
    ownQuery?: boolean;
};

export type AppShell = {
    auth: AuthController;
    http: HttpClient;
    query: QueryClient;
    head?: HeadController;
    theme?: ThemeController;
    stores?: AppShellStores;
    flags?: FeatureFlagController;
    commands?: CommandRegistry;
    history?: HistoryController;
    offlineQueue?: OfflineMutationQueue;
    permissions?: PermissionController;
    epoch: number;
    getEpoch: () => number;
    mutationQueue: SessionMutationQueue;
    onEpochChange: (listener: (epoch: number) => void) => () => void;
    dispose: () => void;
};

export function createAppShell(options: CreateAppShellOptions): AppShell {
    const disposers: Array<() => void> = [];
    const epochListeners = new Set<(epoch: number) => void>();

    const ownedQuery = !options.query;
    const query = options.query ?? createQueryClient(options.createQueryOptions ?? {});

    const createHttpOptions: CreateHttpOptions = {
        ...options.createHttpOptions,
        ...(options.allowAbsoluteUrl !== undefined
            ? { allowAbsoluteUrl: options.allowAbsoluteUrl }
            : {}),
        ...(options.maxResponseBytes !== undefined
            ? { maxResponseBytes: options.maxResponseBytes }
            : {}),
    };

    const httpBind = bindAuthToHttp({
        auth: options.auth,
        ...(options.http ? { http: options.http } : {}),
        ...(Object.keys(createHttpOptions).length > 0 ? { createHttpOptions } : {}),
        ...(options.require ? { require: options.require } : {}),
    });
    disposers.push(httpBind.dispose);

    const queryBind = bindQueryToAuth(options.auth, query, {
        refetchOnReauth: options.refetchOnReauth ?? "all",
        ...(options.authQueryKeys ? { authQueryKeys: options.authQueryKeys } : {}),
        onEpochChange: (epoch) => {
            for (const listener of epochListeners) {
                listener(epoch);
            }
        },
    });
    disposers.push(queryBind.dispose);

    const mutationQueue = createSessionMutationQueue(query, {
        getEpoch: () => options.auth.getEpoch(),
    });
    disposers.push(bindMutationQueueToAuth(options.auth, mutationQueue));
    disposers.push(() => {
        mutationQueue.dispose();
    });

    if (options.theme && options.head) {
        disposers.push(bindThemeToHead(options.theme, options.head).dispose);
    }

    if (options.stores?.session) {
        disposers.push(
            bindAuthToStores(options.auth, {
                sessionStores: [options.stores.session],
                ...(options.resetSessionState !== undefined
                    ? { resetSessionState: options.resetSessionState }
                    : {}),
            }),
        );
    }

    if (options.forms?.draftsClearOnEpoch) {
        const forms = options.forms.register ?? [];
        const formDrafts = options.forms.draftControllers ?? [];
        let lastEpoch = options.auth.getEpoch();
        disposers.push(
            options.auth.subscribe((session) => {
                const epoch = session.epoch ?? 0;
                if (epoch === lastEpoch) {
                    return;
                }
                lastEpoch = epoch;
                for (const form of forms) {
                    form.clearServerErrors();
                }
                for (const draft of formDrafts) {
                    void draft.clear();
                }
            }),
        );
    }

    if (options.drafts?.clearOnEpoch !== false && options.drafts?.controllers) {
        const appDrafts = options.drafts.controllers;
        let lastEpoch = options.auth.getEpoch();
        disposers.push(
            options.auth.subscribe((session) => {
                const epoch = session.epoch ?? 0;
                if (epoch === lastEpoch) {
                    return;
                }
                lastEpoch = epoch;
                for (const draft of appDrafts) {
                    void draft.clear();
                }
            }),
        );
    }

    if (options.offlineQueue) {
        const queue = options.offlineQueue;
        let lastEpoch = options.auth.getEpoch();
        disposers.push(
            options.auth.subscribe((session) => {
                const epoch = session.epoch ?? 0;
                if (epoch === lastEpoch) {
                    return;
                }
                lastEpoch = epoch;
                void queue.dropStale();
            }),
        );
        disposers.push(() => {
            queue.dispose();
        });
    }

    if (options.flags) {
        disposers.push(() => {
            options.flags?.dispose();
        });
    }
    if (options.commands) {
        disposers.push(() => {
            options.commands?.dispose();
        });
    }
    if (options.history) {
        disposers.push(() => {
            options.history?.dispose();
        });
    }
    if (options.permissions) {
        disposers.push(() => {
            options.permissions?.dispose();
        });
    }
    if (options.drafts?.controllers) {
        const appDrafts = options.drafts.controllers;
        disposers.push(() => {
            for (const draft of appDrafts) {
                draft.dispose();
            }
        });
    }

    return {
        auth: options.auth,
        http: httpBind.http,
        query,
        ...(options.head ? { head: options.head } : {}),
        ...(options.theme ? { theme: options.theme } : {}),
        ...(options.stores ? { stores: options.stores } : {}),
        ...(options.flags ? { flags: options.flags } : {}),
        ...(options.commands ? { commands: options.commands } : {}),
        ...(options.history ? { history: options.history } : {}),
        ...(options.offlineQueue ? { offlineQueue: options.offlineQueue } : {}),
        ...(options.permissions ? { permissions: options.permissions } : {}),
        get epoch() {
            return options.auth.getEpoch();
        },
        getEpoch: () => options.auth.getEpoch(),
        mutationQueue,
        onEpochChange: (listener) => {
            epochListeners.add(listener);
            return () => {
                epochListeners.delete(listener);
            };
        },
        dispose: () => {
            for (const dispose of disposers.splice(0).reverse()) {
                dispose();
            }
            epochListeners.clear();
            if (ownedQuery || options.ownQuery) {
                query.dispose();
            }
        },
    };
}

export { bindHeadToQuery, bindMutationForm };
