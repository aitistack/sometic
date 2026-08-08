import { createDisposable, type Disposable } from "../disposable/index.js";
import { SometicError } from "../error/index.js";

export type AsyncOperationStatus = "idle" | "pending" | "success" | "error" | "aborted";

export type AsyncOperationState<TData, TError = unknown> = {
    readonly status: AsyncOperationStatus;
    readonly data: TData | undefined;
    readonly error: TError | undefined;
    readonly attempt: number;
};

export type AsyncOperationOptions<TData, TError = unknown> = {
    initialData?: TData;
    timeoutMs?: number;
    concurrency?: "latest" | "first" | "parallel";
    onStateChange?: (state: AsyncOperationState<TData, TError>) => void;
    mapError?: (error: unknown) => TError;
};

export type AsyncOperationController<TArgs extends unknown[], TData, TError = unknown> = {
    readonly state: AsyncOperationState<TData, TError>;
    execute(...args: TArgs): Promise<TData>;
    retry(): Promise<TData>;
    abort(reason?: unknown): void;
    reset(): void;
    subscribe(listener: (state: AsyncOperationState<TData, TError>) => void): Disposable;
};

type InternalRun = {
    readonly id: number;
    readonly controller: AbortController;
};

export function createAsyncOperation<TArgs extends unknown[], TData, TError = unknown>(
    operation: (signal: AbortSignal, ...args: TArgs) => Promise<TData>,
    options: AsyncOperationOptions<TData, TError> = {},
): AsyncOperationController<TArgs, TData, TError> {
    const concurrency = options.concurrency ?? "latest";
    const listeners = new Set<(state: AsyncOperationState<TData, TError>) => void>();
    let runId = 0;
    let active: InternalRun | undefined;
    let lastArgs: TArgs | undefined;
    let state: AsyncOperationState<TData, TError> = {
        status: "idle",
        data: options.initialData,
        error: undefined,
        attempt: 0,
    };

    const emit = (next: AsyncOperationState<TData, TError>): void => {
        state = next;
        options.onStateChange?.(next);
        for (const listener of listeners) {
            listener(next);
        }
    };

    const mapError = (error: unknown): TError => {
        if (options.mapError) {
            return options.mapError(error);
        }

        return error as TError;
    };

    const abortActive = (reason?: unknown): void => {
        if (!active) {
            return;
        }

        active.controller.abort(reason);
        active = undefined;
    };

    const execute = async (...args: TArgs): Promise<TData> => {
        if (concurrency === "first" && state.status === "pending") {
            throw new SometicError({
                code: "ASYNC_OPERATION_BUSY",
                message: "An async operation is already pending (concurrency: first)",
            });
        }

        if (concurrency === "latest") {
            abortActive();
        }

        const currentId = (runId += 1);
        const controller = new AbortController();
        active = { id: currentId, controller };
        lastArgs = args;

        emit({
            status: "pending",
            data: state.data,
            error: undefined,
            attempt: state.attempt + 1,
        });

        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        if (typeof options.timeoutMs === "number" && options.timeoutMs >= 0) {
            timeoutId = setTimeout(() => {
                controller.abort(
                    new SometicError({
                        code: "ASYNC_OPERATION_TIMEOUT",
                        message: `Async operation timed out after ${String(options.timeoutMs)}ms`,
                    }),
                );
            }, options.timeoutMs);
        }

        try {
            const data = await operation(controller.signal, ...args);
            if (active?.id !== currentId) {
                throw new SometicError({
                    code: "ASYNC_OPERATION_STALE",
                    message: "Async operation result discarded because a newer run started",
                });
            }

            emit({
                status: "success",
                data,
                error: undefined,
                attempt: state.attempt,
            });
            active = undefined;
            return data;
        } catch (error) {
            if (active?.id !== currentId) {
                throw error;
            }

            active = undefined;
            if (controller.signal.aborted) {
                emit({
                    status: "aborted",
                    data: state.data,
                    error: mapError(error),
                    attempt: state.attempt,
                });
                throw error;
            }

            emit({
                status: "error",
                data: state.data,
                error: mapError(error),
                attempt: state.attempt,
            });
            throw error;
        } finally {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }
    };

    return {
        get state() {
            return state;
        },
        execute,
        async retry() {
            if (!lastArgs) {
                throw new SometicError({
                    code: "ASYNC_OPERATION_NO_RETRY_ARGS",
                    message: "Cannot retry before the first execute call",
                });
            }

            return execute(...lastArgs);
        },
        abort(reason) {
            abortActive(reason);
            if (state.status === "pending") {
                emit({
                    status: "aborted",
                    data: state.data,
                    error: mapError(reason),
                    attempt: state.attempt,
                });
            }
        },
        reset() {
            abortActive();
            emit({
                status: "idle",
                data: options.initialData,
                error: undefined,
                attempt: 0,
            });
            lastArgs = undefined;
        },
        subscribe(listener) {
            listeners.add(listener);
            return createDisposable(() => {
                listeners.delete(listener);
            });
        },
    };
}
