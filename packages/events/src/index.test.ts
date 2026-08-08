import { describe, expect, it, vi } from "vitest";
import { createEventEmitter } from "./index.js";

describe("createEventEmitter", () => {
    it("subscribes, emits, and unsubscribes", () => {
        const emitter = createEventEmitter<{ ping: number }>();
        const handler = vi.fn();
        const subscription = emitter.on("ping", handler);

        emitter.emit("ping", 1);
        subscription.dispose();
        emitter.emit("ping", 2);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(1);
    });

    it("supports once and AbortSignal unsubscribe", () => {
        const emitter = createEventEmitter<{ ping: string }>();
        const onceHandler = vi.fn();
        emitter.once("ping", onceHandler);
        emitter.emit("ping", "a");
        emitter.emit("ping", "b");
        expect(onceHandler).toHaveBeenCalledTimes(1);

        const controller = new AbortController();
        const handler = vi.fn();
        emitter.on("ping", handler, { signal: controller.signal });
        controller.abort();
        emitter.emit("ping", "c");
        expect(handler).not.toHaveBeenCalled();
    });

    it("isolates listener errors", () => {
        const onListenerError = vi.fn();
        const emitter = createEventEmitter<{ ping: void }>({ onListenerError });
        emitter.on("ping", () => {
            throw new Error("listener failed");
        });
        const healthy = vi.fn();
        emitter.on("ping", healthy);

        emitter.emit("ping", undefined);
        expect(onListenerError).toHaveBeenCalledTimes(1);
        expect(healthy).toHaveBeenCalledTimes(1);
    });

    it("clears listeners on dispose", () => {
        const emitter = createEventEmitter<{ ping: number }>();
        const handler = vi.fn();
        emitter.on("ping", handler);
        emitter.dispose();
        expect(emitter.disposed).toBe(true);
        expect(() => emitter.emit("ping", 1)).toThrow(/disposed/);
        expect(handler).not.toHaveBeenCalled();
    });
});
