import { describe, expect, it, vi } from "vitest";
import { createCrossTabStore, type CrossTabMessage, type CrossTabTransport } from "./index.js";

function createMemoryTransport(): CrossTabTransport & {
    emit(message: CrossTabMessage): void;
} {
    const listeners = new Set<(message: CrossTabMessage) => void>();
    return {
        post(message) {
            for (const listener of [...listeners]) {
                listener(message);
            }
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            listeners.clear();
        },
        emit(message) {
            for (const listener of [...listeners]) {
                listener(message);
            }
        },
    };
}

describe("createCrossTabStore", () => {
    it("broadcasts local updates and ignores own echoes", () => {
        const transport = createMemoryTransport();
        const postSpy = vi.spyOn(transport, "post");
        const store = createCrossTabStore({ n: 0 }, { key: "counter", transport });

        store.set({ n: 1 });
        expect(postSpy).toHaveBeenCalledTimes(1);
        const message = postSpy.mock.calls[0]?.[0] as CrossTabMessage;
        transport.emit(message);
        expect(store.get()).toEqual({ n: 1 });
        store.dispose();
    });

    it("applies newer remote revisions and prevents loops", () => {
        const transport = createMemoryTransport();
        const store = createCrossTabStore({ n: 0 }, { key: "counter", transport });
        const postSpy = vi.spyOn(transport, "post");

        transport.emit({
            sourceId: "remote",
            key: "counter",
            revision: 2,
            state: { n: 9 },
        });

        expect(store.get()).toEqual({ n: 9 });
        expect(store.revision).toBe(2);
        expect(postSpy).not.toHaveBeenCalled();

        transport.emit({
            sourceId: "remote",
            key: "counter",
            revision: 1,
            state: { n: 1 },
        });
        expect(store.get()).toEqual({ n: 9 });
        store.dispose();
    });

    it("disposes transport subscriptions", () => {
        const transport = createMemoryTransport();
        const disposeSpy = vi.spyOn(transport, "dispose");
        const store = createCrossTabStore(0, { key: "x", transport });
        store.dispose();
        expect(disposeSpy).toHaveBeenCalledTimes(1);
        expect(store.disposed).toBe(true);
    });

    it("drops transport listeners and ignores posts after dispose", () => {
        const transport = createMemoryTransport();
        const store = createCrossTabStore({ n: 0 }, { key: "counter", transport });
        store.dispose();
        store.dispose();
        transport.emit({
            sourceId: "remote",
            key: "counter",
            revision: 4,
            state: { n: 9 },
        });
        expect(() => store.set({ n: 2 })).toThrow(/disposed/);
        expect(store.get()).toEqual({ n: 0 });
    });
});
