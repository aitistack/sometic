import { computed, onScopeDispose, shallowRef, type ComputedRef } from "vue";
import type { Store } from "@sometic/store";

export function useStore<TState>(store: Store<TState>): ComputedRef<TState>;
export function useStore<TState, TSelected>(
    store: Store<TState>,
    selector: (state: TState) => TSelected,
): ComputedRef<TSelected>;
export function useStore<TState, TSelected = TState>(
    store: Store<TState>,
    selector?: (state: TState) => TSelected,
): ComputedRef<TState | TSelected> {
    const version = shallowRef(0);
    const unsubscribe = store.subscribe(() => {
        version.value += 1;
    });
    onScopeDispose(() => {
        unsubscribe();
    });
    return computed(() => {
        void version.value;
        const state = store.get();
        return selector ? selector(state) : state;
    });
}
