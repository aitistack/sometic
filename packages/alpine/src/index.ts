import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";
import type { Disposable } from "@sometic/core/disposable";
import { bindButton, type BindButtonOptions } from "@sometic/dom/button";
import { createStore, type Store } from "@sometic/store";

assertNoImportTimeWindowAccess(false);

export type AlpineCleanup = (callback: () => void) => void;

export type AlpineStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    get(): TState;
    set(state: TState): void;
    update(updater: (state: TState) => TState): void;
    subscribe(listener: (state: TState) => void): () => void;
};

export function createAlpineStoreBind<TState extends object>(
    initialState: TState,
): AlpineStoreBind<TState> {
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

export function bindAlpineButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
    cleanup?: AlpineCleanup,
): Disposable {
    const binding = bindButton(element, getOptions);
    cleanup?.(() => {
        binding.dispose();
    });
    return binding;
}

export type AlpineLike = {
    directive(
        name: string,
        callback: (
            el: HTMLElement,
            options: { expression: string },
            utilities: { cleanup: AlpineCleanup },
        ) => void,
    ): void;
};

export function createAlpineSometicPlugin(
    getButtonOptions: () => BindButtonOptions = () => ({}),
): (alpine: AlpineLike) => void {
    return (alpine) => {
        alpine.directive("sometic-button", (el, _options, utilities) => {
            if (!(el instanceof HTMLButtonElement)) {
                return;
            }
            bindAlpineButton(el, getButtonOptions, utilities.cleanup);
        });
    };
}

export const alpineAdapterCapabilities = ["storeBind", "button"] as const;
