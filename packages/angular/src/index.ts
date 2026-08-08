import { createStore, type Store } from "@sometic/store";
import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";

assertNoImportTimeWindowAccess(false);

export type AngularStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    get(): TState;
    set(state: TState): void;
    update(updater: (state: TState) => TState): void;
    subscribe(listener: (state: TState) => void): () => void;
};

export function createAngularStoreBind<TState extends object>(
    initialState: TState,
): AngularStoreBind<TState> {
    const store = createStore(initialState);
    return {
        store,
        get: () => store.get(),
        set: (state) => {
            store.set(state);
        },
        update: (updater) => {
            store.update(updater);
        },
        subscribe: (listener) => store.subscribe((state) => listener(state)),
        dispose: () => {
            store.dispose();
        },
    };
}

export const angularAdapterCapabilities = ["storeBind"] as const;
