import { createStore, type Store } from "@sometic/store";
import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";

assertNoImportTimeWindowAccess(false);

export type SvelteStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    subscribe(run: (value: TState) => void): () => void;
    set(value: TState): void;
    update(updater: (value: TState) => TState): void;
};

export function createSvelteStoreBind<TState extends object>(
    initialState: TState,
): SvelteStoreBind<TState> {
    const store = createStore(initialState);
    return {
        store,
        subscribe: (run) => {
            run(store.get());
            return store.subscribe((state) => run(state));
        },
        set: (value) => {
            store.set(value);
        },
        update: (updater) => {
            store.update(updater);
        },
        dispose: () => {
            store.dispose();
        },
    };
}

export const svelteAdapterCapabilities = ["storeBind"] as const;
