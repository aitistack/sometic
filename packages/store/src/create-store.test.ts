import { describe, expect, it, vi } from "vitest";
import { createStore } from "./create-store.js";
import { select } from "./select.js";

describe("createStore", () => {
    it("gets, sets, updates, and notifies listeners", () => {
        const store = createStore({ count: 0 });
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        store.set({ count: 1 });
        store.update((state) => ({ count: state.count + 1 }));

        expect(store.get()).toEqual({ count: 2 });
        expect(listener).toHaveBeenCalledTimes(2);
        unsubscribe();
        store.set({ count: 3 });
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("batches notifications", () => {
        const store = createStore(0);
        const listener = vi.fn();
        store.subscribe(listener);

        store.batch(() => {
            store.set(1);
            store.set(2);
            store.set(3);
        });

        expect(store.get()).toBe(3);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(3, 0);
    });

    it("skips equal values and cleans up on dispose", () => {
        const store = createStore("a");
        const listener = vi.fn();
        store.subscribe(listener);
        store.set("a");
        expect(listener).not.toHaveBeenCalled();

        store.dispose();
        expect(store.disposed).toBe(true);
        expect(() => store.set("b")).toThrow(/disposed/);
    });
});

describe("select", () => {
    it("notifies only when the selected slice changes", () => {
        const store = createStore({ a: 1, b: 1 });
        const selected = select(store, (state) => state.a);
        const listener = vi.fn();
        selected.subscribe(listener);

        store.set({ a: 1, b: 2 });
        expect(listener).not.toHaveBeenCalled();
        store.set({ a: 2, b: 2 });
        expect(listener).toHaveBeenCalledWith(2, 1);
        expect(selected.get()).toBe(2);
    });
});
