import { describe, expect, it, vi } from "vitest";
import { createControllableState } from "./index.js";

describe("controllable-state", () => {
    it("supports uncontrolled updates and reset", () => {
        const onChange = vi.fn();
        const state = createControllableState({
            defaultValue: 1,
            onChange,
        });

        expect(state.isControlled).toBe(false);
        expect(state.get()).toBe(1);
        state.set(2);
        expect(state.get()).toBe(2);
        expect(onChange).toHaveBeenCalledWith(2);
        state.reset();
        expect(state.get()).toBe(1);
    });

    it("does not mutate local state when controlled", () => {
        const options = {
            value: "a",
            defaultValue: "fallback",
            onChange: vi.fn(),
        };
        const state = createControllableState(options);

        expect(state.isControlled).toBe(true);
        state.set("b");
        expect(state.get()).toBe("a");
        expect(options.onChange).toHaveBeenCalledWith("b");

        options.value = "b";
        expect(state.get()).toBe("b");
    });

    it("ignores equal values and reentrant onChange sets", () => {
        const state = createControllableState({
            defaultValue: 0,
            onChange(value) {
                state.set(value);
            },
        });

        state.set(1);
        expect(state.get()).toBe(1);
        state.set(1);
        expect(state.get()).toBe(1);
    });

    it("supports functional updates", () => {
        const state = createControllableState({ defaultValue: 10 });
        state.update((current) => current + 5);
        expect(state.get()).toBe(15);
    });
});
