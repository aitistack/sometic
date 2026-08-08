import { describe, expect, it } from "vitest";
import { createSvelteStoreBind } from "./index.js";

describe("svelte store bind", () => {
    it("subscribes like a svelte store", () => {
        const bind = createSvelteStoreBind({ count: 0 });
        const values: number[] = [];
        const stop = bind.subscribe((state) => values.push(state.count));
        bind.update((state) => ({ count: state.count + 1 }));
        stop();
        expect(values).toEqual([0, 1]);
        bind.dispose();
    });
});
