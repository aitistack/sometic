import type {
    CreateStoreOptions,
    DisposableStore,
    StoreEqualityFn,
    StoreListener,
} from "./types.js";

export function createStore<TState>(
    initialState: TState,
    options: CreateStoreOptions<TState> = {},
): DisposableStore<TState> {
    const equalityFn: StoreEqualityFn<TState> = options.equalityFn ?? Object.is;
    const listeners = new Set<StoreListener<TState>>();
    let state = initialState;
    let disposed = false;
    let batchDepth = 0;
    let pendingPrevious: TState | undefined;
    let pending = false;
    let notifying = false;

    const assertNotDisposed = (): void => {
        if (disposed) {
            throw new Error("Store has already been disposed");
        }
    };

    const notify = (): void => {
        if (batchDepth > 0 || !pending || notifying) {
            return;
        }

        pending = false;
        const previous = pendingPrevious as TState;
        pendingPrevious = undefined;
        const current = state;
        notifying = true;
        try {
            for (const listener of [...listeners]) {
                listener(current, previous);
            }
        } finally {
            notifying = false;
            if (pending && batchDepth === 0) {
                notify();
            }
        }
    };

    const commit = (nextState: TState): void => {
        assertNotDisposed();
        if (equalityFn(state, nextState)) {
            return;
        }

        if (!pending) {
            pendingPrevious = state;
            pending = true;
        }

        state = nextState;
        notify();
    };

    return {
        get disposed() {
            return disposed;
        },
        get() {
            return state;
        },
        set(nextState) {
            commit(nextState);
        },
        update(updater) {
            commit(updater(state));
        },
        batch(run) {
            assertNotDisposed();
            batchDepth += 1;
            try {
                run();
            } finally {
                batchDepth -= 1;
                notify();
            }
        },
        subscribe(listener) {
            assertNotDisposed();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            if (disposed) {
                return;
            }

            disposed = true;
            listeners.clear();
            pending = false;
            pendingPrevious = undefined;
        },
    };
}
