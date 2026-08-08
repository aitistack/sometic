import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";
import type { Disposable } from "@sometic/core/disposable";
import { bindButton, type BindButtonOptions } from "@sometic/dom/button";
import { createStore, type Store } from "@sometic/store";

assertNoImportTimeWindowAccess(false);

const DATA_KEY = Symbol("someticButtonBinding");

type ButtonWithBinding = HTMLButtonElement & {
    [DATA_KEY]?: Disposable;
};

export type JQueryStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    get(): TState;
    set(state: TState): void;
    update(updater: (state: TState) => TState): void;
    subscribe(listener: (state: TState) => void): () => void;
};

export function createJQueryStoreBind<TState extends object>(
    initialState: TState,
): JQueryStoreBind<TState> {
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

export function bindJQueryButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
): Disposable {
    const host = element as ButtonWithBinding;
    host[DATA_KEY]?.dispose();
    const binding = bindButton(element, getOptions);
    host[DATA_KEY] = binding;
    return {
        get disposed() {
            return binding.disposed;
        },
        dispose() {
            binding.dispose();
            delete host[DATA_KEY];
        },
    };
}

export type JQueryInstanceLike = {
    each(callback: (this: HTMLElement, index: number) => void): JQueryInstanceLike;
    data(key: string, value?: unknown): unknown;
};

export type JQueryStaticLike = {
    fn: Record<string, unknown>;
    (element: Element): JQueryInstanceLike;
};

export type JQueryButtonCommand = "destroy" | BindButtonOptions | (() => BindButtonOptions);

export function registerJQueryAdapters($: JQueryStaticLike): void {
    $.fn.someticButton = function someticButton(
        this: JQueryInstanceLike,
        command?: JQueryButtonCommand,
    ): JQueryInstanceLike {
        if (command === "destroy") {
            return this.each(function destroyEach() {
                if (!(this instanceof HTMLButtonElement)) {
                    return;
                }
                const host = this as ButtonWithBinding;
                host[DATA_KEY]?.dispose();
                delete host[DATA_KEY];
            });
        }
        const getOptions =
            typeof command === "function"
                ? command
                : () => (command && typeof command === "object" ? command : {});
        return this.each(function bindEach() {
            if (!(this instanceof HTMLButtonElement)) {
                return;
            }
            bindJQueryButton(this, getOptions);
        });
    };
}

export const jqueryAdapterCapabilities = ["storeBind", "button"] as const;
