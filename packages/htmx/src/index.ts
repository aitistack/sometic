import {
    assertNoImportTimeWindowAccess,
    type AdapterLifecycleContract,
} from "@sometic/adapter-contract";
import type { Disposable } from "@sometic/core/disposable";
import { bindButton, type BindButtonOptions } from "@sometic/dom/button";
import { createStore, type Store } from "@sometic/store";

assertNoImportTimeWindowAccess(false);

export type HtmxStoreBind<TState> = AdapterLifecycleContract & {
    readonly store: Store<TState>;
    get(): TState;
    set(state: TState): void;
    update(updater: (state: TState) => TState): void;
    subscribe(listener: (state: TState) => void): () => void;
};

export function createHtmxStoreBind<TState extends object>(
    initialState: TState,
): HtmxStoreBind<TState> {
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

export function bindHtmxButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
): Disposable {
    return bindButton(element, getOptions);
}

export type HtmxBinderRegistration = {
    selector: string;
    bind: (element: Element) => Disposable;
};

export type HtmxBinderRoot = AdapterLifecycleContract & {
    register(registration: HtmxBinderRegistration): void;
    scan(scope?: ParentNode): void;
};

export function createHtmxBinderRoot(root: ParentNode & EventTarget): HtmxBinderRoot {
    const registrations: HtmxBinderRegistration[] = [];
    const active = new Map<Element, Disposable>();

    const prune = (): void => {
        for (const [element, binding] of [...active.entries()]) {
            if (!element.isConnected) {
                binding.dispose();
                active.delete(element);
            }
        }
    };

    const scan = (scope: ParentNode = root): void => {
        prune();
        for (const registration of registrations) {
            for (const element of scope.querySelectorAll(registration.selector)) {
                const previous = active.get(element);
                previous?.dispose();
                active.set(element, registration.bind(element));
            }
        }
    };

    const onSettle = (): void => {
        scan();
    };

    root.addEventListener("htmx:afterSettle", onSettle);

    return {
        register(registration) {
            registrations.push(registration);
            scan();
        },
        scan,
        dispose() {
            root.removeEventListener("htmx:afterSettle", onSettle);
            for (const binding of active.values()) {
                binding.dispose();
            }
            active.clear();
            registrations.length = 0;
        },
    };
}

export const htmxAdapterCapabilities = ["storeBind", "button"] as const;
