export type QueryKey = readonly unknown[];

export type QueryStatus = "pending" | "error" | "success";

export type FetchStatus = "fetching" | "idle" | "paused";

export type QueryState<TData = unknown, TError = Error> = {
    status: QueryStatus;
    data: TData | undefined;
    error: TError | null;
    dataUpdatedAt: number;
    errorUpdatedAt: number;
    fetchStatus: FetchStatus;
    isInvalidated: boolean;
};

export type QueryFilters = {
    queryKey?: QueryKey;
    exact?: boolean;
    predicate?: (entry: { queryKey: QueryKey; queryHash: string }) => boolean;
};

export type QueryFunctionContext = {
    queryKey: QueryKey;
    signal: AbortSignal;
};

export type QueryFunction<TData> = (context: QueryFunctionContext) => Promise<TData>;

export type DefaultQueryOptions = {
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    refetchOnSubscribe?: boolean;
};

export type CreateQueryClientOptions = {
    defaultOptions?: {
        queries?: DefaultQueryOptions;
    };
};

export type QueryObserverOptions<TData = unknown> = {
    queryKey: QueryKey;
    queryFn: QueryFunction<TData>;
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    refetchOnSubscribe?: boolean;
    initialData?: TData;
    select?: (data: TData) => unknown;
    meta?: {
        auth?: boolean;
        [key: string]: unknown;
    };
};

export type QueryObserverResult<TData = unknown, TError = Error> = {
    status: QueryStatus;
    data: TData | undefined;
    error: TError | null;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    isStale: boolean;
    isEmpty: boolean;
    refetch: () => Promise<QueryObserverResult<TData, TError>>;
};

export type MutationStatus = "idle" | "pending" | "error" | "success";

export type MutationFunctionContext = {
    signal: AbortSignal;
};

export type MutationFunction<TData, TVariables> = (
    variables: TVariables,
    context: MutationFunctionContext,
) => Promise<TData>;

export type MutateOptions<TData, TError, TVariables, TContext> = {
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
    onSettled?: (
        data: TData | undefined,
        error: TError | null,
        variables: TVariables,
        context: TContext | undefined,
    ) => void;
};

export type MutationObserverOptions<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
> = {
    mutationFn: MutationFunction<TData, TVariables>;
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
    onSettled?: (
        data: TData | undefined,
        error: TError | null,
        variables: TVariables,
        context: TContext | undefined,
    ) => void;
    invalidateKeys?: QueryKey[];
};

export type MutationObserverResult<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
> = {
    status: MutationStatus;
    data: TData | undefined;
    error: TError | null;
    isIdle: boolean;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    variables: TVariables | undefined;
    mutate: (
        variables: TVariables,
        options?: MutateOptions<TData, TError, TVariables, TContext>,
    ) => Promise<TData>;
    reset: () => void;
};
