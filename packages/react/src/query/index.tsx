import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {
    createMutationObserver,
    createQueryClient,
    createQueryObserver,
    hashQueryKey,
    type CreateQueryClientOptions,
    type MutationObserver,
    type MutationObserverOptions,
    type MutationObserverResult,
    type QueryClient,
    type QueryObserver,
    type QueryObserverOptions,
    type QueryObserverResult,
} from "@sometic/query";

const QueryClientContext = createContext<QueryClient | null>(null);

export type QueryClientProviderProps = {
    client?: QueryClient;
    options?: CreateQueryClientOptions;
    children: ReactNode;
};

export function QueryClientProvider(props: QueryClientProviderProps): ReactNode {
    const ownedRef = useRef<QueryClient | null>(null);
    if (props.client) {
        ownedRef.current = null;
    } else if (!ownedRef.current) {
        ownedRef.current = createQueryClient(props.options ?? {});
    }
    const client = props.client ?? ownedRef.current;
    if (!client) {
        throw new Error("QueryClientProvider requires client or options");
    }

    useEffect(() => {
        if (props.client) {
            return;
        }
        return () => {
            ownedRef.current?.dispose();
            ownedRef.current = null;
        };
    }, [props.client]);

    return createElement(QueryClientContext.Provider, { value: client }, props.children);
}

export function useQueryClient(): QueryClient {
    const client = useContext(QueryClientContext);
    if (!client) {
        throw new Error("useQueryClient requires QueryClientProvider");
    }
    return client;
}

export function useQuery<TData = unknown, TError = Error>(
    options: QueryObserverOptions<TData>,
): QueryObserverResult<TData, TError> {
    const client = useQueryClient();
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const observerRef = useRef<{
        client: QueryClient;
        observer: QueryObserver<TData, TError>;
    } | null>(null);
    if (!observerRef.current || observerRef.current.client !== client) {
        observerRef.current?.observer.destroy();
        observerRef.current = {
            client,
            observer: createQueryObserver<TData, TError>(client, optionsRef.current),
        };
    }
    const observer = observerRef.current.observer;

    const queryKeyHash = useMemo(() => hashQueryKey(options.queryKey), [options.queryKey]);

    useEffect(() => {
        observer.setOptions(optionsRef.current);
    }, [
        observer,
        queryKeyHash,
        options.enabled,
        options.staleTime,
        options.gcTime,
        options.retry,
        options.refetchOnSubscribe,
        options.queryFn,
        options.select,
        options.initialData,
    ]);

    const snapshotRef = useRef<QueryObserverResult<TData, TError> | null>(null);

    const subscribe = useCallback(
        (onStoreChange: () => void) =>
            observer.subscribe(() => {
                snapshotRef.current = null;
                onStoreChange();
            }),
        [observer],
    );

    const getSnapshot = useCallback(() => {
        const cached = snapshotRef.current;
        if (cached) {
            return cached;
        }
        const next = observer.getCurrentResult();
        snapshotRef.current = next;
        return next;
    }, [observer]);

    useEffect(() => {
        return () => {
            observer.destroy();
            if (observerRef.current?.observer === observer) {
                observerRef.current = null;
            }
            snapshotRef.current = null;
        };
    }, [observer]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
    options: MutationObserverOptions<TData, TError, TVariables, TContext>,
): MutationObserverResult<TData, TError, TVariables, TContext> {
    const client = useQueryClient();
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const observerRef = useRef<{
        client: QueryClient;
        observer: MutationObserver<TData, TError, TVariables, TContext>;
    } | null>(null);
    if (!observerRef.current || observerRef.current.client !== client) {
        observerRef.current?.observer.destroy();
        observerRef.current = {
            client,
            observer: createMutationObserver(client, optionsRef.current),
        };
    }
    const observer = observerRef.current.observer;

    useEffect(() => {
        observer.setOptions(optionsRef.current);
    }, [
        observer,
        options.mutationFn,
        options.onMutate,
        options.onSuccess,
        options.onError,
        options.onSettled,
    ]);

    const snapshotRef = useRef<MutationObserverResult<TData, TError, TVariables, TContext> | null>(
        null,
    );

    const subscribe = useCallback(
        (onStoreChange: () => void) =>
            observer.subscribe(() => {
                snapshotRef.current = null;
                onStoreChange();
            }),
        [observer],
    );

    const getSnapshot = useCallback(() => {
        const cached = snapshotRef.current;
        if (cached) {
            return cached;
        }
        const next = observer.getCurrentResult();
        snapshotRef.current = next;
        return next;
    }, [observer]);

    useEffect(() => {
        return () => {
            observer.destroy();
            if (observerRef.current?.observer === observer) {
                observerRef.current = null;
            }
            snapshotRef.current = null;
        };
    }, [observer]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export {
    createHttpQueryFn,
    createMutationObserver,
    createQueryClient,
    createQueryObserver,
    hashQueryKey,
} from "@sometic/query";
export type {
    MutationObserverOptions,
    MutationObserverResult,
    QueryClient,
    QueryKey,
    QueryObserverOptions,
    QueryObserverResult,
} from "@sometic/query";
