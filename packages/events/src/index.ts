import { createDisposable, type Disposable } from "@sometic/core/disposable";

export type EventHandler<TPayload> = (payload: TPayload) => void;

export type EventMap = Record<string, unknown>;

export type EventEmitter<TEvents extends EventMap> = {
    on<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: EventHandler<TEvents[TEventName]>,
        options?: { signal?: AbortSignal },
    ): Disposable;
    once<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: EventHandler<TEvents[TEventName]>,
        options?: { signal?: AbortSignal },
    ): Disposable;
    off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: EventHandler<TEvents[TEventName]>,
    ): void;
    emit<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        payload: TEvents[TEventName],
    ): void;
    listenerCount<TEventName extends keyof TEvents & string>(eventName: TEventName): number;
    dispose(): void;
    readonly disposed: boolean;
};

type Listener<TPayload> = {
    readonly handler: EventHandler<TPayload>;
    readonly once: boolean;
};

export type CreateEventEmitterOptions = {
    onListenerError?: (error: unknown, eventName: string) => void;
};

export function createEventEmitter<TEvents extends EventMap>(
    options: CreateEventEmitterOptions = {},
): EventEmitter<TEvents> {
    const listeners = new Map<string, Set<Listener<unknown>>>();
    let disposed = false;

    const assertNotDisposed = (): void => {
        if (disposed) {
            throw new Error("EventEmitter has already been disposed");
        }
    };

    const remove = (eventName: string, handler: EventHandler<unknown>): void => {
        const set = listeners.get(eventName);
        if (!set) {
            return;
        }

        for (const listener of set) {
            if (listener.handler === handler) {
                set.delete(listener);
            }
        }

        if (set.size === 0) {
            listeners.delete(eventName);
        }
    };

    const add = <TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: EventHandler<TEvents[TEventName]>,
        once: boolean,
        signal?: AbortSignal,
    ): Disposable => {
        assertNotDisposed();

        if (signal?.aborted) {
            return createDisposable(() => undefined);
        }

        let set = listeners.get(eventName);
        if (!set) {
            set = new Set();
            listeners.set(eventName, set);
        }

        const listener: Listener<unknown> = {
            handler: handler as EventHandler<unknown>,
            once,
        };
        set.add(listener);

        const disposable = createDisposable(() => {
            remove(eventName, handler as EventHandler<unknown>);
            signal?.removeEventListener("abort", abortListener);
        });

        const abortListener = (): void => {
            disposable.dispose();
        };

        signal?.addEventListener("abort", abortListener, { once: true });
        return disposable;
    };

    return {
        get disposed() {
            return disposed;
        },
        on(eventName, handler, subscriptionOptions) {
            return add(eventName, handler, false, subscriptionOptions?.signal);
        },
        once(eventName, handler, subscriptionOptions) {
            return add(eventName, handler, true, subscriptionOptions?.signal);
        },
        off(eventName, handler) {
            remove(eventName, handler as EventHandler<unknown>);
        },
        emit(eventName, payload) {
            assertNotDisposed();
            const set = listeners.get(eventName);
            if (!set || set.size === 0) {
                return;
            }

            const snapshot = [...set];
            for (const listener of snapshot) {
                if (listener.once) {
                    set.delete(listener);
                }

                try {
                    listener.handler(payload);
                } catch (error) {
                    options.onListenerError?.(error, eventName);
                }
            }

            if (set.size === 0) {
                listeners.delete(eventName);
            }
        },
        listenerCount(eventName) {
            return listeners.get(eventName)?.size ?? 0;
        },
        dispose() {
            if (disposed) {
                return;
            }

            disposed = true;
            listeners.clear();
        },
    };
}
