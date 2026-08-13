import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";

export type HistoryEntry<TResult = unknown> = {
    id?: string;
    label?: string;
    execute: () => TResult | Promise<TResult>;
    undo: (result: TResult) => void | Promise<void>;
    redo?: (result: TResult) => TResult | Promise<TResult>;
};

type StackItem = {
    id: string;
    label: string | undefined;
    result: unknown;
    undo: (result: unknown) => void | Promise<void>;
    redo: (result: unknown) => unknown | Promise<unknown>;
};

export type CreateHistoryControllerOptions = {
    maxDepth?: number;
    onChange?: (state: HistoryState) => void;
};

export type HistoryState = {
    canUndo: boolean;
    canRedo: boolean;
    undoDepth: number;
    redoDepth: number;
};

export type HistoryController = {
    execute: <TResult>(entry: HistoryEntry<TResult>) => Promise<TResult>;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    canUndo: () => boolean;
    canRedo: () => boolean;
    checkpoint: (label?: string) => void;
    clear: () => void;
    getState: () => HistoryState;
    subscribe: (listener: (state: HistoryState) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

export function createHistoryController(
    options: CreateHistoryControllerOptions = {},
): HistoryController {
    const maxDepth = Math.max(1, Math.floor(options.maxDepth ?? 100));
    const undoStack: StackItem[] = [];
    const redoStack: StackItem[] = [];
    const listeners = new Set<(state: HistoryState) => void>();
    let seq = 0;
    let chain: Promise<void> = Promise.resolve();

    const disposable = createDisposable(() => {
        undoStack.length = 0;
        redoStack.length = 0;
        listeners.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "HISTORY_DISPOSED",
                message: "This history controller has been disposed",
            });
        }
    };

    const state = (): HistoryState => ({
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undoDepth: undoStack.length,
        redoDepth: redoStack.length,
    });

    const emit = (): void => {
        const next = state();
        options.onChange?.(next);
        for (const listener of listeners) {
            listener(next);
        }
    };

    const runExclusive = async <T>(fn: () => Promise<T>): Promise<T> => {
        let result!: T;
        chain = chain.then(async () => {
            result = await fn();
        });
        await chain;
        return result;
    };

    return {
        execute(entry) {
            return runExclusive(async () => {
                assertActive();
                const result = await entry.execute();
                undoStack.push({
                    id: entry.id ?? `hist-${String((seq += 1))}`,
                    label: entry.label,
                    result,
                    undo: entry.undo as (result: unknown) => void | Promise<void>,
                    redo:
                        (entry.redo as
                            ((result: unknown) => unknown | Promise<unknown>) | undefined) ??
                        (async () => entry.execute()),
                });
                while (undoStack.length > maxDepth) {
                    undoStack.shift();
                }
                redoStack.length = 0;
                emit();
                return result;
            });
        },
        undo() {
            return runExclusive(async () => {
                assertActive();
                const item = undoStack.pop();
                if (!item) {
                    throw createError({
                        code: "HISTORY_NOTHING_TO_UNDO",
                        message: "Nothing to undo",
                    });
                }
                await item.undo(item.result);
                redoStack.push(item);
                emit();
            });
        },
        redo() {
            return runExclusive(async () => {
                assertActive();
                const item = redoStack.pop();
                if (!item) {
                    throw createError({
                        code: "HISTORY_NOTHING_TO_REDO",
                        message: "Nothing to redo",
                    });
                }
                const result = await item.redo(item.result);
                item.result = result;
                undoStack.push(item);
                emit();
            });
        },
        canUndo() {
            assertActive();
            return undoStack.length > 0;
        },
        canRedo() {
            assertActive();
            return redoStack.length > 0;
        },
        checkpoint(label) {
            assertActive();
            void this.execute({
                label: label ?? "checkpoint",
                execute: () => undefined,
                undo: () => undefined,
            });
        },
        clear() {
            assertActive();
            undoStack.length = 0;
            redoStack.length = 0;
            emit();
        },
        getState() {
            assertActive();
            return state();
        },
        subscribe(listener) {
            assertActive();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
