import {
    createAsyncOperation,
    type AsyncOperationController,
    type AsyncOperationOptions,
} from "@sometic/core/async-operation";
import type { Disposable } from "@sometic/core/disposable";
import {
    handleButtonPress,
    resolveButton,
    type ButtonViewModel,
    type ResolveButtonOptions,
} from "../button/index.js";

export type CreateAsyncButtonControllerOptions<TData> = ResolveButtonOptions & {
    action: (signal: AbortSignal) => Promise<TData>;
    operation?: AsyncOperationOptions<TData>;
};

export type AsyncButtonController<TData> = {
    readonly operation: AsyncOperationController<[], TData>;
    resolve(options?: ResolveButtonOptions): ButtonViewModel;
    press(event: { preventDefault(): void }): Promise<TData | undefined>;
    subscribe(listener: () => void): Disposable;
};

export function createAsyncButtonController<TData>(
    options: CreateAsyncButtonControllerOptions<TData>,
): AsyncButtonController<TData> {
    const operation = createAsyncOperation(
        async (signal) => options.action(signal),
        options.operation,
    );

    const resolve = (styleOptions: ResolveButtonOptions = {}): ButtonViewModel =>
        resolveButton({
            ...options,
            ...styleOptions,
            loading: operation.state.status === "pending" || styleOptions.loading === true,
            disabled: options.disabled === true || styleOptions.disabled === true,
        });

    return {
        operation,
        resolve,
        async press(event) {
            const view = resolve();
            let started = false;
            handleButtonPress(view, event, () => {
                started = true;
            });
            if (!started) {
                return undefined;
            }
            return operation.execute();
        },
        subscribe(listener) {
            return operation.subscribe(() => {
                listener();
            });
        },
    };
}
