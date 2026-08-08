import { useCallback, useRef, useSyncExternalStore } from "react";
import type { Store } from "@sometic/store";

export function useStore<TState>(store: Store<TState>): TState;
export function useStore<TState, TSelected>(
    store: Store<TState>,
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected;
export function useStore<TState, TSelected = TState>(
    store: Store<TState>,
    selector?: (state: TState) => TSelected,
    equalityFn: (left: TSelected, right: TSelected) => boolean = Object.is,
): TState | TSelected {
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const equalityRef = useRef(equalityFn);
    equalityRef.current = equalityFn;
    const selectedRef = useRef<TState | TSelected | undefined>(undefined);

    const subscribe = useCallback(
        (onStoreChange: () => void) => store.subscribe(() => onStoreChange()),
        [store],
    );

    const getSnapshot = useCallback(() => {
        const state = store.get();
        const next = selectorRef.current
            ? selectorRef.current(state)
            : (state as unknown as TSelected);
        const previous = selectedRef.current as TSelected | undefined;
        if (previous !== undefined && equalityRef.current(previous, next)) {
            return previous;
        }
        selectedRef.current = next;
        return next;
    }, [store]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
