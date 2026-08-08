import { createStore, type Store } from "@sometic/store";
import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";

assertNoImportTimeWindowAccess(false);

export type PreactStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    getSnapshot(): TState;
    subscribe(onStoreChange: () => void): () => void;
    set(state: TState): void;
};

export function createPreactStoreBind<TState extends object>(
    initialState: TState,
): PreactStoreBind<TState> {
    const store = createStore(initialState);
    return {
        store,
        getSnapshot: () => store.get(),
        subscribe: (onStoreChange) => store.subscribe(() => onStoreChange()),
        set: (state) => {
            store.set(state);
        },
        dispose: () => {
            store.dispose();
        },
    };
}

export const preactAdapterCapabilities = ["storeBind"] as const;
