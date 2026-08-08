import { describe, expect, it } from "vitest";
import {
    createPersistenceProfile,
    createPrefsStore,
    createSessionStore,
    createUiStore,
} from "./index.js";
import { createMemoryStorage } from "../persistent/index.js";
import {
    createCrossTabStore,
    type CrossTabMessage,
    type CrossTabTransport,
} from "../cross-tab/index.js";

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

describe("store kinds", () => {
    it("createUiStore and createSessionStore are memory stores", () => {
        const ui = createUiStore({ open: false });
        ui.set({ open: true });
        expect(ui.get().open).toBe(true);
        ui.dispose();

        const session = createSessionStore({ token: "secret" });
        expect(session.get().token).toBe("secret");
        session.dispose();
    });

    it("createPrefsStore persists and strips denyKeys", async () => {
        const storage = createMemoryStorage();
        const prefs = createPrefsStore(
            { theme: "dark", password: "secret", remember: true },
            {
                key: "prefs",
                storage,
                denyKeys: ["password"],
            },
        );
        if (!("hydrated" in prefs)) {
            throw new Error("expected persistent prefs store");
        }
        await prefs.hydrated;
        prefs.set({ theme: "light", password: "next", remember: false });
        await prefs.persistNow();
        const raw = await storage.getItem("prefs");
        expect(raw).toBeTruthy();
        expect(raw).not.toContain("password");
        expect(raw).toContain("light");
        prefs.dispose();
    });

    it("createPersistenceProfile can encrypt envelopes", () => {
        const profile = createPersistenceProfile<{ n: number }>({
            version: 2,
            encrypt: {
                encrypt: (value) => `enc:${value}`,
                decrypt: (value) => value.replace(/^enc:/, ""),
            },
        });
        const serialized = profile.serialize!({ version: 2, state: { n: 1 } });
        expect(serialized.startsWith("enc:")).toBe(true);
        expect(profile.deserialize!(serialized)).toEqual({ version: 2, state: { n: 1 } });
    });
});

describe("cross-tab conflictPolicy", () => {
    it("leader ignores remote when local is leader", () => {
        const transport = createMemoryTransport();
        const store = createCrossTabStore(
            { n: 0 },
            { key: "counter", transport, conflictPolicy: "leader" },
        );
        store.set({ n: 1 });
        transport.emit({
            sourceId: "remote",
            key: "counter",
            revision: 99,
            state: { n: 99 },
            electedAt: store.electedAt + 1000,
        });
        expect(store.get().n).toBe(1);
        store.dispose();
    });

    it("lww accepts newer remote revisions", () => {
        const transport = createMemoryTransport();
        const store = createCrossTabStore(
            { n: 0 },
            { key: "counter", transport, conflictPolicy: "lww" },
        );
        transport.emit({
            sourceId: "remote",
            key: "counter",
            revision: 2,
            state: { n: 2 },
        });
        expect(store.get().n).toBe(2);
        store.dispose();
    });
});
