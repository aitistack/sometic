import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {
    createMutationObserver,
    createQueryClient,
    createQueryObserver,
    type CreateQueryClientOptions,
    type MutationObserverOptions,
    type MutationObserverResult,
    type QueryClient,
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
    const client = useMemo(() => {
        if (props.client) {
            return props.client;
        }
        return createQueryClient(props.options ?? {});
    }, [props.client, props.options]);

    useEffect(() => {
        if (props.client) {
            return;
        }
        return () => {
            client.dispose();
        };
    }, [client, props.client]);

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
    const observer = useMemo(
        () => createQueryObserver<TData, TError>(client, optionsRef.current),
        [client],
    );

    useEffect(() => {
        observer.setOptions(options);
    }, [observer, options]);

    useEffect(() => {
        return () => {
            observer.destroy();
        };
    }, [observer]);

    return useSyncExternalStore(
        (onStoreChange) => observer.subscribe(onStoreChange),
        () => observer.getCurrentResult(),
        () => observer.getCurrentResult(),
    );
}

export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
    options: MutationObserverOptions<TData, TError, TVariables, TContext>,
): MutationObserverResult<TData, TError, TVariables, TContext> {
    const client = useQueryClient();
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const observer = useMemo(() => createMutationObserver(client, optionsRef.current), [client]);
    const [, setTick] = useState(0);

    useEffect(() => {
        observer.setOptions(options);
    }, [observer, options]);

    useEffect(() => {
        const stop = observer.subscribe(() => {
            setTick((value) => value + 1);
        });
        return () => {
            stop();
            observer.destroy();
        };
    }, [observer]);

    return observer.getCurrentResult();
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
