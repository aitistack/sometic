import { createStore, type Store } from "@sometic/store";
import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";

assertNoImportTimeWindowAccess(false);

export type SolidStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    get(): TState;
    set(state: TState): void;
    subscribe(listener: (state: TState) => void): () => void;
};

export function createSolidStoreBind<TState extends object>(
    initialState: TState,
): SolidStoreBind<TState> {
    const store = createStore(initialState);
    return {
        store,
        get: () => store.get(),
        set: (state) => {
            store.set(state);
        },
        subscribe: (listener) => store.subscribe((state) => listener(state)),
        dispose: () => {
            store.dispose();
        },
    };
}

export const solidAdapterCapabilities = ["storeBind"] as const;
