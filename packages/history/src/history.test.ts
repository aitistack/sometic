import { describe, expect, it, vi } from "vitest";
import { createHistoryController } from "./history.js";

describe("createHistoryController", () => {
    it("executes entries and supports undo and redo", async () => {
        const history = createHistoryController();
        const values: number[] = [];

        await history.execute({
            id: "add-1",
            label: "Add one",
            execute: () => {
                values.push(1);
                return 1;
            },
            undo: (result) => {
                expect(result).toBe(1);
                values.pop();
            },
        });

        expect(values).toEqual([1]);
        expect(history.canUndo()).toBe(true);
        expect(history.canRedo()).toBe(false);
        expect(history.getState()).toEqual({
            canUndo: true,
            canRedo: false,
            undoDepth: 1,
            redoDepth: 0,
        });

        await history.undo();
        expect(values).toEqual([]);
        expect(history.canRedo()).toBe(true);

        await history.redo();
        expect(values).toEqual([1]);
        history.dispose();
    });

    it("clears redo on a new execute and uses custom redo when provided", async () => {
        const history = createHistoryController();
        let value = 0;

        await history.execute({
            execute: () => {
                value = 1;
                return 1;
            },
            undo: () => {
                value = 0;
            },
            redo: () => {
                value = 2;
                return 2;
            },
        });
        await history.undo();
        expect(value).toBe(0);

        await history.execute({
            execute: () => {
                value = 9;
                return 9;
            },
            undo: () => {
                value = 0;
            },
        });
        expect(history.canRedo()).toBe(false);
        expect(value).toBe(9);

        await history.undo();
        await history.redo();
        expect(value).toBe(9);

        const custom = createHistoryController();
        let customValue = 0;
        await custom.execute({
            execute: () => {
                customValue = 1;
                return 1;
            },
            undo: () => {
                customValue = 0;
            },
            redo: () => {
                customValue = 5;
                return 5;
            },
        });
        await custom.undo();
        await custom.redo();
        expect(customValue).toBe(5);
        custom.dispose();
        history.dispose();
    });

    it("enforces maxDepth and rejects empty undo or redo", async () => {
        const history = createHistoryController({ maxDepth: 2 });
        await history.execute({
            execute: () => 1,
            undo: () => undefined,
        });
        await history.execute({
            execute: () => 2,
            undo: () => undefined,
        });
        await history.execute({
            execute: () => 3,
            undo: () => undefined,
        });
        expect(history.getState().undoDepth).toBe(2);

        await expect(
            createHistoryController().undo(),
        ).rejects.toMatchObject({ code: "HISTORY_NOTHING_TO_UNDO" });
        await expect(
            createHistoryController().redo(),
        ).rejects.toMatchObject({ code: "HISTORY_NOTHING_TO_REDO" });
        history.dispose();
    });

    it("serializes concurrent execute, undo, and redo", async () => {
        const history = createHistoryController();
        const order: string[] = [];

        const first = history.execute({
            execute: async () => {
                order.push("exec-start");
                await Promise.resolve();
                order.push("exec-end");
                return 1;
            },
            undo: async () => {
                order.push("undo");
            },
        });
        const second = history.execute({
            execute: async () => {
                order.push("second");
                return 2;
            },
            undo: () => undefined,
        });

        await Promise.all([first, second]);
        expect(order).toEqual(["exec-start", "exec-end", "second"]);

        await Promise.all([history.undo(), history.undo()]);
        expect(history.getState().undoDepth).toBe(0);
        history.dispose();
    });

    it("emits onChange, supports checkpoint and clear, and unsubscribes", async () => {
        const onChange = vi.fn();
        const history = createHistoryController({ onChange });
        const listener = vi.fn();
        const stop = history.subscribe(listener);

        await history.execute({
            execute: () => 1,
            undo: () => undefined,
        });
        expect(onChange).toHaveBeenCalled();
        expect(listener).toHaveBeenCalled();

        history.checkpoint("mark");
        await vi.waitFor(() => {
            expect(history.getState().undoDepth).toBe(2);
        });

        history.clear();
        expect(history.getState()).toEqual({
            canUndo: false,
            canRedo: false,
            undoDepth: 0,
            redoDepth: 0,
        });

        stop();
        listener.mockClear();
        await history.execute({
            execute: () => 2,
            undo: () => undefined,
        });
        expect(listener).not.toHaveBeenCalled();
        history.dispose();
    });

    it("rejects work after dispose", async () => {
        const history = createHistoryController();
        history.dispose();
        expect(history.disposed).toBe(true);
        await expect(
            history.execute({
                execute: () => 1,
                undo: () => undefined,
            }),
        ).rejects.toThrow(/disposed/);
        expect(() => history.canUndo()).toThrow(/disposed/);
        expect(() => history.clear()).toThrow(/disposed/);
        expect(() => history.subscribe(() => undefined)).toThrow(/disposed/);
    });
});
