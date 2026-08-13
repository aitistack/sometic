import { describe, expect, it, vi } from "vitest";
import {
    clientWinsStrategy,
    createConflictController,
    lastWriteWinsStrategy,
    serverWinsStrategy,
} from "./conflict.js";

describe("built-in conflict strategies", () => {
    it("resolves last-write-wins, client-wins, and server-wins", () => {
        const base = {
            id: "c1",
            key: "doc",
            local: "local",
            remote: "remote",
            localUpdatedAt: 10,
            remoteUpdatedAt: 20,
            status: "open" as const,
        };
        expect(lastWriteWinsStrategy.resolve(base)).toBe("remote");
        expect(
            lastWriteWinsStrategy.resolve({ ...base, localUpdatedAt: 30 }),
        ).toBe("local");
        expect(clientWinsStrategy.resolve(base)).toBe("local");
        expect(serverWinsStrategy.resolve(base)).toBe("remote");
    });
});

describe("createConflictController", () => {
    it("opens conflicts and resolves with the default strategy", () => {
        const onChange = vi.fn();
        const conflicts = createConflictController({
            now: () => 100,
            onChange,
        });

        const opened = conflicts.open({
            key: "invoice:1",
            local: { total: 10 },
            remote: { total: 12 },
            localUpdatedAt: 50,
            remoteUpdatedAt: 80,
        });

        expect(opened.status).toBe("open");
        expect(opened.localUpdatedAt).toBe(50);
        expect(onChange).toHaveBeenCalled();
        expect(conflicts.list("open")).toHaveLength(1);

        const resolved = conflicts.resolve(opened.id);
        expect(resolved.status).toBe("resolved");
        expect(resolved.resolution).toEqual({ total: 12 });
        expect(resolved.strategyId).toBe("lww");
        expect(conflicts.resolve(opened.id)).toEqual(resolved);
        conflicts.dispose();
    });

    it("supports resolveWith, strategy selection, and clearResolved", () => {
        const conflicts = createConflictController({
            defaultStrategyId: "client-wins",
        });
        const opened = conflicts.open({
            key: "doc",
            local: "L",
            remote: "R",
            id: "fixed-id",
        });
        expect(opened.id).toBe("fixed-id");

        expect(conflicts.resolve(opened.id, "server-wins").resolution).toBe("R");
        const again = conflicts.open({ key: "doc", local: 1, remote: 2 });
        expect(conflicts.resolve(again.id).resolution).toBe(1);

        const manual = conflicts.open({ key: "doc", local: "a", remote: "b" });
        expect(conflicts.resolveWith(manual.id, "merged").resolution).toBe("merged");
        expect(conflicts.get(manual.id)?.strategyId).toBe("manual");

        expect(conflicts.list("resolved")).toHaveLength(3);
        conflicts.clearResolved();
        expect(conflicts.list()).toHaveLength(0);
        conflicts.dispose();
    });

    it("registers custom strategies and rejects duplicates and unknown defaults", () => {
        expect(() =>
            createConflictController({ defaultStrategyId: "missing" }),
        ).toThrow(/Unknown default strategy/);

        const conflicts = createConflictController({
            strategies: [
                {
                    id: "prefer-longer",
                    resolve: (conflict) => {
                        const local = String(conflict.local);
                        const remote = String(conflict.remote);
                        return local.length >= remote.length ? local : remote;
                    },
                },
            ],
        });

        expect(() =>
            conflicts.registerStrategy({
                id: "lww",
                resolve: (conflict) => conflict.local,
            }),
        ).toThrow(/already registered/);

        const unregister = conflicts.registerStrategy({
            id: "always-local",
            resolve: (conflict) => conflict.local,
        });
        const opened = conflicts.open({ key: "k", local: "aa", remote: "b" });
        expect(conflicts.resolve(opened.id, "prefer-longer").resolution).toBe("aa");

        const next = conflicts.open({ key: "k", local: 1, remote: 2 });
        expect(conflicts.resolve(next.id, "always-local").resolution).toBe(1);
        unregister();
        const afterUnregister = conflicts.open({ key: "k", local: 3, remote: 4 });
        expect(() => conflicts.resolve(afterUnregister.id, "always-local")).toThrow(
            /Unknown strategy/,
        );
        conflicts.dispose();
    });

    it("rejects invalid keys and unknown conflict ids", () => {
        const conflicts = createConflictController();
        expect(() =>
            conflicts.open({ key: " ", local: 1, remote: 2 }),
        ).toThrow(/non-empty string/);
        expect(() => conflicts.resolve("missing")).toThrow(/Unknown conflict/);
        expect(() => conflicts.resolveWith("missing", 1)).toThrow(/Unknown conflict/);
        const opened = conflicts.open({ key: "ok", local: 1, remote: 2 });
        expect(() => conflicts.resolve(opened.id, "nope")).toThrow(/Unknown strategy/);
        expect(conflicts.get("missing")).toBeUndefined();
        conflicts.dispose();
    });

    it("returns copies from get and list so callers cannot mutate internal state", () => {
        const conflicts = createConflictController();
        const opened = conflicts.open({ key: "doc", local: { n: 1 }, remote: { n: 2 } });
        const got = conflicts.get(opened.id)!;
        got.status = "resolved";
        expect(conflicts.get(opened.id)?.status).toBe("open");

        const listed = conflicts.list();
        listed[0]!.status = "resolved";
        expect(conflicts.list()[0]?.status).toBe("open");
        conflicts.dispose();
    });

    it("notifies subscribers and rejects work after dispose", () => {
        const conflicts = createConflictController();
        const listener = vi.fn();
        const stop = conflicts.subscribe(listener);
        conflicts.open({ key: "doc", local: 1, remote: 2 });
        expect(listener).toHaveBeenCalled();
        stop();
        listener.mockClear();
        conflicts.open({ key: "doc", local: 3, remote: 4 });
        expect(listener).not.toHaveBeenCalled();

        conflicts.dispose();
        expect(conflicts.disposed).toBe(true);
        expect(() => conflicts.open({ key: "doc", local: 1, remote: 2 })).toThrow(
            /disposed/,
        );
        expect(() => conflicts.list()).toThrow(/disposed/);
        expect(() => conflicts.subscribe(() => undefined)).toThrow(/disposed/);
    });
});
