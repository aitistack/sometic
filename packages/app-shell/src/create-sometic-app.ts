import type { AuthController, PermissionController } from "@sometic/auth";
import type { CommandRegistry } from "@sometic/commands";
import type { FeatureFlagController } from "@sometic/feature-flags";
import type { HeadController } from "@sometic/head";
import type { HistoryController } from "@sometic/history";
import type { CreateHttpOptions, HttpClient } from "@sometic/http";
import type { OfflineMutationQueue } from "@sometic/offline-queue";
import {
    createQueryObserver,
    type CreateQueryClientOptions,
    type QueryClient,
    type QueryFilters,
    type QueryKey,
    type QueryObserver,
    type QueryObserverOptions,
} from "@sometic/query";
import { createThemeController, type ThemeController } from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";
import {
    createAppShell,
    type AppShell,
    type AppShellStores,
    type CreateAppShellOptions,
} from "./create-app-shell.js";
import type { RefetchOnReauth } from "./bind-query.js";

export type CreateSometicAppOptions = {
    auth: AuthController;
    baseUrl?: string;
    http?: HttpClient;
    createHttpOptions?: CreateHttpOptions;
    query?: QueryClient | true;
    createQueryOptions?: CreateQueryClientOptions;
    head?: HeadController;
    theme?: ThemeController | true;
    stores?: AppShellStores;
    refetchOnReauth?: RefetchOnReauth;
    authQueryKeys?: readonly QueryKey[];
    require?: CreateAppShellOptions["require"];
    resetSessionState?: unknown;
    forms?: CreateAppShellOptions["forms"];
    flags?: FeatureFlagController;
    drafts?: CreateAppShellOptions["drafts"];
    commands?: CommandRegistry;
    history?: HistoryController;
    offlineQueue?: OfflineMutationQueue;
    permissions?: PermissionController;
};

export type SometicAppQueryDefineOptions<TData> = Omit<
    QueryObserverOptions<TData>,
    "queryKey" | "queryFn"
>;

export type SometicAppQuery = QueryClient & {
    define: <TData = unknown>(
        queryKey: QueryKey,
        queryFn: () => Promise<TData>,
        options?: SometicAppQueryDefineOptions<TData>,
    ) => QueryObserver<TData>;
    invalidate: (filters?: QueryFilters | QueryKey) => Promise<void>;
};

export type SometicApp = Omit<AppShell, "query"> & {
    query: SometicAppQuery;
    whenReauth: (listener: (epoch: number) => void) => () => void;
};

function resolveTheme(theme: ThemeController | true | undefined): ThemeController | undefined {
    if (theme === true) {
        return createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "system",
        });
    }
    return theme;
}

function resolveInvalidateFilters(filters: QueryFilters | QueryKey): QueryFilters {
    if (Array.isArray(filters)) {
        return { queryKey: filters };
    }
    return filters as QueryFilters;
}

function wrapQuery(client: QueryClient): SometicAppQuery {
    const define = <TData = unknown>(
        queryKey: QueryKey,
        queryFn: () => Promise<TData>,
        options?: SometicAppQueryDefineOptions<TData>,
    ): QueryObserver<TData> =>
        createQueryObserver(client, {
            queryKey,
            queryFn,
            ...options,
        });

    const invalidate = async (filters?: QueryFilters | QueryKey): Promise<void> => {
        if (filters === undefined) {
            await client.invalidateQueries();
            return;
        }
        await client.invalidateQueries(resolveInvalidateFilters(filters));
    };

    return Object.assign(client, { define, invalidate });
}

export function createSometicApp(options: CreateSometicAppOptions): SometicApp {
    const ownsTheme = options.theme === true;
    const theme = resolveTheme(options.theme);
    const createHttpOptions: CreateHttpOptions = {
        ...options.createHttpOptions,
        ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    };

    const shell = createAppShell({
        auth: options.auth,
        ...(options.http ? { http: options.http } : {}),
        ...(Object.keys(createHttpOptions).length > 0 ? { createHttpOptions } : {}),
        ...(options.query !== undefined && options.query !== true ? { query: options.query } : {}),
        ...(options.createQueryOptions ? { createQueryOptions: options.createQueryOptions } : {}),
        ...(options.head ? { head: options.head } : {}),
        ...(theme ? { theme } : {}),
        ...(options.stores ? { stores: options.stores } : {}),
        ...(options.refetchOnReauth ? { refetchOnReauth: options.refetchOnReauth } : {}),
        ...(options.authQueryKeys ? { authQueryKeys: options.authQueryKeys } : {}),
        ...(options.require ? { require: options.require } : {}),
        ...(options.resetSessionState !== undefined
            ? { resetSessionState: options.resetSessionState }
            : {}),
        ...(options.forms ? { forms: options.forms } : {}),
        ...(options.flags ? { flags: options.flags } : {}),
        ...(options.drafts ? { drafts: options.drafts } : {}),
        ...(options.commands ? { commands: options.commands } : {}),
        ...(options.history ? { history: options.history } : {}),
        ...(options.offlineQueue ? { offlineQueue: options.offlineQueue } : {}),
        ...(options.permissions ? { permissions: options.permissions } : {}),
    });

    return {
        ...shell,
        query: wrapQuery(shell.query),
        whenReauth: (listener) => shell.onEpochChange(listener),
        dispose: () => {
            shell.dispose();
            if (ownsTheme) {
                theme?.dispose();
            }
        },
    };
}
