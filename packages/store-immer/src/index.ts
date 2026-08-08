import { createStore, type CreateStoreOptions, type DisposableStore } from "@sometic/store";
import { produce, type Draft } from "immer";

export type ImmerUpdater<TState> = (draft: Draft<TState>) => void;

export type ImmerStore<TState> = DisposableStore<TState> & {
    produce(updater: ImmerUpdater<TState>): void;
};

export function createImmerStore<TState extends object>(
    initialState: TState,
    options: CreateStoreOptions<TState> = {},
): ImmerStore<TState> {
    const store = createStore(initialState, options);

    return {
        get disposed() {
            return store.disposed;
        },
        get: store.get.bind(store),
        set: store.set.bind(store),
        update: store.update.bind(store),
        batch: store.batch.bind(store),
        subscribe: store.subscribe.bind(store),
        dispose: store.dispose.bind(store),
        produce(updater) {
            store.set(produce(store.get(), updater));
        },
    };
}
