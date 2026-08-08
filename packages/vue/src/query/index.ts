import {
    inject,
    onScopeDispose,
    provide,
    shallowRef,
    watch,
    type InjectionKey,
    type Ref,
    type ShallowRef,
} from "vue";
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

const queryKey: InjectionKey<QueryClient> = Symbol("sometic-query");

export function provideQueryClient(
    options: CreateQueryClientOptions | QueryClient = {},
): QueryClient {
    const client =
        options && "fetchQuery" in options
            ? options
            : createQueryClient(options as CreateQueryClientOptions);
    provide(queryKey, client);
    onScopeDispose(() => {
        if (!(options && "fetchQuery" in options)) {
            client.dispose();
        }
    });
    return client;
}

export function useQueryClient(): QueryClient {
    const client = inject(queryKey);
    if (!client) {
        throw new Error("useQueryClient requires provideQueryClient");
    }
    return client;
}

function resolveOptions<T>(options: T | Ref<T>): T {
    if (options && typeof options === "object" && "value" in options) {
        return (options as Ref<T>).value;
    }
    return options as T;
}

export function useQuery<TData = unknown, TError = Error>(
    options: QueryObserverOptions<TData> | Ref<QueryObserverOptions<TData>>,
): ShallowRef<QueryObserverResult<TData, TError>> {
    const client = useQueryClient();
    const initial = resolveOptions(options);
    const observer = createQueryObserver<TData, TError>(client, initial);
    const result = shallowRef(observer.getCurrentResult()) as ShallowRef<
        QueryObserverResult<TData, TError>
    >;
    const stop = observer.subscribe(() => {
        result.value = observer.getCurrentResult();
    });
    watch(
        () => resolveOptions(options),
        (next) => {
            observer.setOptions(next);
        },
        { deep: true },
    );
    onScopeDispose(() => {
        stop();
        observer.destroy();
    });
    return result;
}

export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
    options: MutationObserverOptions<TData, TError, TVariables, TContext>,
): ShallowRef<MutationObserverResult<TData, TError, TVariables, TContext>> {
    const client = useQueryClient();
    const observer = createMutationObserver(client, options);
    const result = shallowRef(observer.getCurrentResult()) as ShallowRef<
        MutationObserverResult<TData, TError, TVariables, TContext>
    >;
    const stop = observer.subscribe(() => {
        result.value = observer.getCurrentResult();
    });
    onScopeDispose(() => {
        stop();
        observer.destroy();
    });
    return result;
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
