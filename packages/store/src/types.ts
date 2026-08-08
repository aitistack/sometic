import type { Disposable } from "@sometic/core/disposable";

export type StoreListener<TState> = (state: TState, previousState: TState) => void;

export type StoreUnsubscribe = () => void;

export type StoreEqualityFn<TValue> = (left: TValue, right: TValue) => boolean;

export interface Store<TState> {
    get(): TState;
    set(nextState: TState): void;
    update(updater: (currentState: TState) => TState): void;
    subscribe(listener: StoreListener<TState>): StoreUnsubscribe;
}

export interface DisposableStore<TState> extends Store<TState>, Disposable {
    batch(run: () => void): void;
}

export type CreateStoreOptions<TState> = {
    equalityFn?: StoreEqualityFn<TState>;
};
