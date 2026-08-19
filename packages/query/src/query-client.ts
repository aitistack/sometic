import { hashQueryKey, partialMatchKey } from "./keys/index.js";
import type {
    CreateQueryClientOptions,
    DefaultQueryOptions,
    MutateOptions,
    MutationObserverOptions,
    MutationObserverResult,
    MutationStatus,
    QueryFilters,
    QueryFunction,
    QueryKey,
    QueryObserverOptions,
    QueryObserverResult,
    QueryState,
} from "./types.js";

type CacheEntry = {
    queryKey: QueryKey;
    queryHash: string;
    state: QueryState;
    queryFn?: QueryFunction<unknown>;
    options: DefaultQueryOptions;
    promise?: Promise<unknown>;
    abort?: AbortController;
    observers: Set<() => void>;
    gcTimer?: ReturnType<typeof setTimeout>;
};

function defaultState(): QueryState {
    return {
        status: "pending",
        data: undefined,
        error: null,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        fetchStatus: "idle",
        isInvalidated: false,
    };
}

function resolveRetry(retry: number | boolean | undefined): number {
    if (retry === false) {
        return 0;
    }
    if (retry === true || retry === undefined) {
        return 1;
    }
    return Math.max(0, retry);
}

function pickDefined<T extends Record<string, unknown>>(input: T): Partial<T> {
    const out: Record<string, unknown> = Object.create(null);
    for (const [key, value] of Object.entries(input)) {
        if (key === "__proto__" || key === "prototype" || key === "constructor") {
            continue;
        }
        if (value !== undefined) {
            out[key] = value;
        }
    }
    return out as Partial<T>;
}

function isEmptyData(data: unknown): boolean {
    if (data == null) {
        return true;
    }
    if (Array.isArray(data)) {
        return data.length === 0;
    }
    if (typeof data === "string") {
        return data.length === 0;
    }
    return false;
}

function isStaleState(state: QueryState, staleTime: number, now = Date.now()): boolean {
    if (state.isInvalidated) {
        return true;
    }
    if (state.status !== "success") {
        return true;
    }
    if (staleTime === Number.POSITIVE_INFINITY) {
        return false;
    }
    return now - state.dataUpdatedAt >= staleTime;
}

export type QueryClient = {
    getQueryData: <TData = unknown>(queryKey: QueryKey) => TData | undefined;
    setQueryData: <TData = unknown>(
        queryKey: QueryKey,
        updater: TData | ((previous: TData | undefined) => TData),
    ) => TData;
    invalidateQueries: (filters?: QueryFilters) => Promise<void>;
    removeQueries: (filters?: QueryFilters) => void;
    clear: () => void;
    fetchQuery: <TData>(options: {
        queryKey: QueryKey;
        queryFn: QueryFunction<TData>;
        staleTime?: number;
        gcTime?: number;
        retry?: number | boolean;
    }) => Promise<TData>;
    ensureQueryData: <TData>(options: {
        queryKey: QueryKey;
        queryFn: QueryFunction<TData>;
        staleTime?: number;
        gcTime?: number;
        retry?: number | boolean;
    }) => Promise<TData>;
    getQueryState: <TData = unknown, TError = Error>(
        queryKey: QueryKey,
    ) => QueryState<TData, TError> | undefined;
    track: (
        queryKey: QueryKey,
        listener: () => void,
        meta?: { queryFn?: QueryFunction<unknown>; options?: DefaultQueryOptions },
    ) => () => void;
    subscribe: (listener: () => void) => () => void;
    dispose: () => void;
    getDefaultOptions: () => DefaultQueryOptions;
};

export type QueryObserver<TData = unknown, TError = Error> = {
    subscribe: (listener: () => void) => () => void;
    getCurrentResult: () => QueryObserverResult<TData, TError>;
    setOptions: (options: QueryObserverOptions<TData>) => void;
    refetch: () => Promise<QueryObserverResult<TData, TError>>;
    destroy: () => void;
};

export type MutationObserver<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
> = {
    subscribe: (listener: () => void) => () => void;
    getCurrentResult: () => MutationObserverResult<TData, TError, TVariables, TContext>;
    setOptions: (options: MutationObserverOptions<TData, TError, TVariables, TContext>) => void;
    mutate: (
        variables: TVariables,
        mutateOptions?: MutateOptions<TData, TError, TVariables, TContext>,
    ) => Promise<TData>;
    reset: () => void;
    destroy: () => void;
};

export function createQueryClient(options: CreateQueryClientOptions = {}): QueryClient {
    const defaults: DefaultQueryOptions = {
        staleTime: 0,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnSubscribe: true,
        ...options.defaultOptions?.queries,
    };
    const cache = new Map<string, CacheEntry>();
    const listeners = new Set<() => void>();
    let disposed = false;

    const notify = (): void => {
        for (const listener of listeners) {
            listener();
        }
    };

    const notifyEntry = (entry: CacheEntry): void => {
        for (const listener of entry.observers) {
            listener();
        }
        notify();
    };

    const clearGc = (entry: CacheEntry): void => {
        if (entry.gcTimer !== undefined) {
            clearTimeout(entry.gcTimer);
            delete entry.gcTimer;
        }
    };

    const scheduleGc = (entry: CacheEntry): void => {
        clearGc(entry);
        if (entry.observers.size > 0) {
            return;
        }
        const gcTime = entry.options.gcTime ?? defaults.gcTime ?? 5 * 60_000;
        if (gcTime === Number.POSITIVE_INFINITY) {
            return;
        }
        entry.gcTimer = setTimeout(() => {
            if (entry.observers.size === 0) {
                cache.delete(entry.queryHash);
                notify();
            }
        }, gcTime);
    };

    const ensureEntry = (
        queryKey: QueryKey,
        queryOptions: DefaultQueryOptions = {},
    ): CacheEntry => {
        const queryHash = hashQueryKey(queryKey);
        let entry = cache.get(queryHash);
        if (!entry) {
            entry = {
                queryKey,
                queryHash,
                state: defaultState(),
                options: { ...defaults, ...queryOptions },
                observers: new Set(),
            };
            cache.set(queryHash, entry);
        } else {
            entry.options = { ...entry.options, ...queryOptions };
        }
        return entry;
    };

    const matchesFilters = (entry: CacheEntry, filters: QueryFilters = {}): boolean => {
        if (filters.predicate && !filters.predicate(entry)) {
            return false;
        }
        if (!filters.queryKey) {
            return true;
        }
        if (filters.exact === true) {
            return entry.queryHash === hashQueryKey(filters.queryKey);
        }
        return partialMatchKey(entry.queryKey, filters.queryKey);
    };

    const fetchEntry = async <TData>(
        entry: CacheEntry,
        queryFn: QueryFunction<TData>,
        retryOption?: number | boolean,
    ): Promise<TData> => {
        if (entry.promise) {
            return entry.promise as Promise<TData>;
        }
        entry.queryFn = queryFn as QueryFunction<unknown>;
        entry.abort?.abort();
        const abort = new AbortController();
        entry.abort = abort;
        entry.state = {
            ...entry.state,
            fetchStatus: "fetching",
        };
        notifyEntry(entry);

        const retries = resolveRetry(retryOption ?? entry.options.retry ?? defaults.retry);
        const run = async (): Promise<TData> => {
            let attempt = 0;
            for (;;) {
                try {
                    const data = await queryFn({
                        queryKey: entry.queryKey,
                        signal: abort.signal,
                    });
                    entry.state = {
                        status: "success",
                        data,
                        error: null,
                        dataUpdatedAt: Date.now(),
                        errorUpdatedAt: entry.state.errorUpdatedAt,
                        fetchStatus: "idle",
                        isInvalidated: false,
                    };
                    notifyEntry(entry);
                    return data;
                } catch (error) {
                    if (abort.signal.aborted) {
                        if (entry.abort === abort && entry.state.fetchStatus === "fetching") {
                            entry.state = { ...entry.state, fetchStatus: "idle" };
                            notifyEntry(entry);
                        }
                        throw error;
                    }
                    if (attempt >= retries) {
                        entry.state = {
                            ...entry.state,
                            status: "error",
                            error: error as Error,
                            errorUpdatedAt: Date.now(),
                            fetchStatus: "idle",
                        };
                        notifyEntry(entry);
                        throw error;
                    }
                    attempt += 1;
                }
            }
        };

        const promise = run().finally(() => {
            if (entry.promise === promise) {
                delete entry.promise;
            }
        });
        entry.promise = promise;
        return promise;
    };

    const client: QueryClient = {
        getDefaultOptions() {
            return { ...defaults };
        },
        getQueryData<TData>(queryKey: QueryKey) {
            const entry = cache.get(hashQueryKey(queryKey));
            return entry?.state.data as TData | undefined;
        },
        setQueryData<TData>(
            queryKey: QueryKey,
            updater: TData | ((previous: TData | undefined) => TData),
        ) {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            const entry = ensureEntry(queryKey);
            const previous = entry.state.data as TData | undefined;
            const next =
                typeof updater === "function"
                    ? (updater as (previous: TData | undefined) => TData)(previous)
                    : updater;
            entry.state = {
                status: "success",
                data: next,
                error: null,
                dataUpdatedAt: Date.now(),
                errorUpdatedAt: entry.state.errorUpdatedAt,
                fetchStatus: entry.state.fetchStatus,
                isInvalidated: false,
            };
            notifyEntry(entry);
            return next;
        },
        getQueryState<TData, TError>(queryKey: QueryKey) {
            const entry = cache.get(hashQueryKey(queryKey));
            return entry?.state as QueryState<TData, TError> | undefined;
        },
        track(queryKey, listener, meta = {}) {
            const entry = ensureEntry(queryKey, meta.options ?? {});
            if (meta.queryFn) {
                entry.queryFn = meta.queryFn;
            }
            entry.observers.add(listener);
            clearGc(entry);
            return () => {
                entry.observers.delete(listener);
                if (entry.observers.size === 0) {
                    entry.abort?.abort();
                    if (entry.state.fetchStatus === "fetching") {
                        entry.state = { ...entry.state, fetchStatus: "idle" };
                        notifyEntry(entry);
                    }
                }
                scheduleGc(entry);
            };
        },
        async fetchQuery(fetchOptions) {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            const entry = ensureEntry(
                fetchOptions.queryKey,
                pickDefined({
                    staleTime: fetchOptions.staleTime,
                    gcTime: fetchOptions.gcTime,
                    retry: fetchOptions.retry,
                }),
            );
            return fetchEntry(entry, fetchOptions.queryFn, fetchOptions.retry);
        },
        async ensureQueryData(fetchOptions) {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            const entry = ensureEntry(
                fetchOptions.queryKey,
                pickDefined({
                    staleTime: fetchOptions.staleTime,
                    gcTime: fetchOptions.gcTime,
                    retry: fetchOptions.retry,
                }),
            );
            const staleTime =
                fetchOptions.staleTime ?? entry.options.staleTime ?? defaults.staleTime ?? 0;
            if (entry.state.status === "success" && !isStaleState(entry.state, staleTime)) {
                return entry.state.data as never;
            }
            return client.fetchQuery(fetchOptions);
        },
        async invalidateQueries(filters = {}) {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            const jobs: Promise<unknown>[] = [];
            for (const entry of cache.values()) {
                if (!matchesFilters(entry, filters)) {
                    continue;
                }
                entry.state = { ...entry.state, isInvalidated: true };
                notifyEntry(entry);
                if (entry.observers.size > 0 && entry.queryFn) {
                    jobs.push(fetchEntry(entry, entry.queryFn, entry.options.retry));
                }
            }
            await Promise.allSettled(jobs);
        },
        removeQueries(filters = {}) {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            for (const entry of [...cache.values()]) {
                if (!matchesFilters(entry, filters)) {
                    continue;
                }
                entry.abort?.abort();
                clearGc(entry);
                entry.observers.clear();
                cache.delete(entry.queryHash);
            }
            notify();
        },
        clear() {
            if (disposed) {
                throw new Error("QueryClient is disposed");
            }
            for (const entry of cache.values()) {
                entry.abort?.abort();
                clearGc(entry);
                entry.observers.clear();
            }
            cache.clear();
            notify();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            disposed = true;
            for (const entry of cache.values()) {
                entry.abort?.abort();
                clearGc(entry);
                entry.observers.clear();
            }
            cache.clear();
            listeners.clear();
        },
    };

    return client;
}

export function createQueryObserver<TData = unknown, TError = Error>(
    client: QueryClient,
    initialOptions: QueryObserverOptions<TData>,
): QueryObserver<TData, TError> {
    let options = initialOptions;
    const listeners = new Set<() => void>();
    let current: QueryObserverResult<TData, TError>;
    let untrack: (() => void) | undefined;

    const buildResult = (): QueryObserverResult<TData, TError> => {
        const state = client.getQueryState<TData, TError>(options.queryKey) ?? defaultState();
        const staleTime = options.staleTime ?? client.getDefaultOptions().staleTime ?? 0;
        const selected =
            state.data !== undefined && options.select
                ? (options.select(state.data as TData) as TData)
                : (state.data as TData | undefined);
        return {
            status: state.status,
            data: selected,
            error: state.error as TError | null,
            isPending: state.status === "pending",
            isError: state.status === "error",
            isSuccess: state.status === "success",
            isFetching: state.fetchStatus === "fetching",
            isStale: isStaleState(state as QueryState, staleTime),
            isEmpty: state.status === "success" && isEmptyData(selected),
            refetch: () => observer.refetch(),
        };
    };

    const notify = (): void => {
        current = buildResult();
        for (const listener of listeners) {
            listener();
        }
    };

    const trackEntry = (): void => {
        untrack?.();
        untrack = client.track(
            options.queryKey,
            () => {
                notify();
            },
            {
                queryFn: options.queryFn as QueryFunction<unknown>,
                options: pickDefined({
                    staleTime: options.staleTime,
                    gcTime: options.gcTime,
                    retry: options.retry,
                    refetchOnSubscribe: options.refetchOnSubscribe,
                }),
            },
        );
    };

    const maybeFetch = async (): Promise<void> => {
        if (options.enabled === false) {
            return;
        }
        trackEntry();
        const staleTime = options.staleTime ?? client.getDefaultOptions().staleTime ?? 0;
        const state = client.getQueryState(options.queryKey);
        const shouldRefetch =
            !state ||
            state.status !== "success" ||
            state.isInvalidated ||
            isStaleState(state, staleTime);
        if (!shouldRefetch) {
            notify();
            return;
        }
        await client
            .fetchQuery({
                queryKey: options.queryKey,
                queryFn: options.queryFn,
                ...pickDefined({
                    staleTime: options.staleTime,
                    gcTime: options.gcTime,
                    retry: options.retry,
                }),
            })
            .catch(() => undefined);
        notify();
    };

    if (options.initialData !== undefined) {
        client.setQueryData(options.queryKey, options.initialData);
    }

    const observer: QueryObserver<TData, TError> = {
        subscribe(listener) {
            const wasEmpty = listeners.size === 0;
            listeners.add(listener);
            if (wasEmpty) {
                trackEntry();
                const refetchOnSubscribe =
                    options.refetchOnSubscribe ??
                    client.getDefaultOptions().refetchOnSubscribe ??
                    true;
                if (refetchOnSubscribe) {
                    void maybeFetch();
                } else {
                    notify();
                }
            } else {
                listener();
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    untrack?.();
                    untrack = undefined;
                }
            };
        },
        getCurrentResult() {
            if (!current) {
                current = buildResult();
            }
            return current;
        },
        setOptions(next) {
            options = next;
            if (listeners.size > 0) {
                trackEntry();
                void maybeFetch();
            }
        },
        async refetch() {
            await client.fetchQuery({
                queryKey: options.queryKey,
                queryFn: options.queryFn,
                ...pickDefined({
                    staleTime: options.staleTime,
                    gcTime: options.gcTime,
                    retry: options.retry,
                }),
            });
            notify();
            return observer.getCurrentResult();
        },
        destroy() {
            listeners.clear();
            untrack?.();
            untrack = undefined;
        },
    };

    current = buildResult();
    return observer;
}

export function createMutationObserver<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
>(
    client: QueryClient,
    initialOptions: MutationObserverOptions<TData, TError, TVariables, TContext>,
): MutationObserver<TData, TError, TVariables, TContext> {
    let options = initialOptions;
    const listeners = new Set<() => void>();
    let status: MutationStatus = "idle";
    let data: TData | undefined;
    let error: TError | null = null;
    let variables: TVariables | undefined;
    let activeAbort: AbortController | undefined;
    let mutateGeneration = 0;

    const notify = (): void => {
        for (const listener of listeners) {
            listener();
        }
    };

    const buildResult = (): MutationObserverResult<TData, TError, TVariables, TContext> => ({
        status,
        data,
        error,
        isIdle: status === "idle",
        isPending: status === "pending",
        isError: status === "error",
        isSuccess: status === "success",
        variables,
        mutate: (vars, mutateOptions) =>
            observer.mutate(
                vars,
                mutateOptions as MutateOptions<TData, TError, TVariables, TContext> | undefined,
            ),
        reset: () => observer.reset(),
    });

    const observer: MutationObserver<TData, TError, TVariables, TContext> = {
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getCurrentResult() {
            return buildResult();
        },
        setOptions(next) {
            options = next;
        },
        async mutate(vars, mutateOptions) {
            activeAbort?.abort();
            const generation = (mutateGeneration += 1);
            const abort = new AbortController();
            activeAbort = abort;
            variables = vars;
            status = "pending";
            error = null;
            notify();
            let context: TContext | undefined;
            const onMutate = mutateOptions?.onMutate ?? options.onMutate;
            const onSuccess = mutateOptions?.onSuccess ?? options.onSuccess;
            const onError = mutateOptions?.onError ?? options.onError;
            const onSettled = mutateOptions?.onSettled ?? options.onSettled;
            try {
                if (onMutate) {
                    context = await onMutate(vars);
                }
                if (generation !== mutateGeneration || abort.signal.aborted) {
                    throw abort.signal.reason instanceof Error
                        ? abort.signal.reason
                        : new Error("Mutation superseded");
                }
                const result = await options.mutationFn(vars, { signal: abort.signal });
                if (generation !== mutateGeneration) {
                    return result;
                }
                data = result;
                status = "success";
                onSuccess?.(result, vars, context);
                if (options.invalidateKeys) {
                    await Promise.all(
                        options.invalidateKeys.map((key) =>
                            client.invalidateQueries({ queryKey: key }),
                        ),
                    );
                }
                if (generation !== mutateGeneration) {
                    return result;
                }
                onSettled?.(result, null, vars, context);
                notify();
                return result;
            } catch (err) {
                if (generation !== mutateGeneration) {
                    throw err;
                }
                error = err as TError;
                status = "error";
                onError?.(error, vars, context);
                onSettled?.(undefined, error, vars, context);
                notify();
                throw err;
            } finally {
                if (activeAbort === abort) {
                    activeAbort = undefined;
                }
            }
        },
        reset() {
            status = "idle";
            data = undefined;
            error = null;
            variables = undefined;
            notify();
        },
        destroy() {
            activeAbort?.abort();
            activeAbort = undefined;
            mutateGeneration += 1;
            listeners.clear();
        },
    };

    return observer;
}
