import type { Store, StoreEqualityFn, StoreUnsubscribe } from "./types.js";

export type Selector<TState, TSelected> = (state: TState) => TSelected;

export function select<TState, TSelected>(
    store: Store<TState>,
    selector: Selector<TState, TSelected>,
    equalityFn: StoreEqualityFn<TSelected> = Object.is,
): {
    get(): TSelected;
    subscribe(listener: (selected: TSelected, previous: TSelected) => void): StoreUnsubscribe;
} {
    return {
        get() {
            return selector(store.get());
        },
        subscribe(listener) {
            let current = selector(store.get());
            return store.subscribe((state) => {
                const next = selector(state);
                if (!equalityFn(current, next)) {
                    const previous = current;
                    current = next;
                    listener(next, previous);
                }
            });
        },
    };
}
