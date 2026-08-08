import { describe, expect, it, vi } from "vitest";
import { createDisposable, DisposableStack } from "./index.js";

describe("disposable", () => {
    it("disposes once", () => {
        const onDispose = vi.fn();
        const disposable = createDisposable(onDispose);

        disposable.dispose();
        disposable.dispose();

        expect(onDispose).toHaveBeenCalledTimes(1);
        expect(disposable.disposed).toBe(true);
    });

    it("runs DisposableStack entries in reverse order and isolates errors", () => {
        const order: number[] = [];
        const stack = new DisposableStack();
        stack.defer(() => {
            order.push(1);
        });
        stack.use(() => {
            order.push(2);
            throw new Error("boom");
        });
        stack.use(
            createDisposable(() => {
                order.push(3);
            }),
        );

        expect(() => {
            stack.dispose();
        }).toThrow("boom");
        expect(order).toEqual([3, 2, 1]);
        expect(stack.disposed).toBe(true);
    });

    it("rejects use after dispose", () => {
        const stack = new DisposableStack();
        stack.dispose();
        expect(() => {
            stack.defer(() => undefined);
        }).toThrow(/already been disposed/);
    });

    it("moves remaining disposables to a new stack", () => {
        const onDispose = vi.fn();
        const stack = new DisposableStack();
        stack.defer(onDispose);
        const moved = stack.move();

        expect(stack.disposed).toBe(true);
        moved.dispose();
        expect(onDispose).toHaveBeenCalledTimes(1);
    });
});
