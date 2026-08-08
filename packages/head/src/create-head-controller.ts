import type { Disposable } from "@sometic/core/disposable";
import { mergePatches } from "./merge.js";
import type { HeadPatch, HeadSnapshot } from "./types.js";

export type HeadController = Disposable & {
    get(): HeadSnapshot;
    set(id: string, patch: HeadPatch): void;
    remove(id: string): void;
    subscribe(listener: (snapshot: HeadSnapshot) => void): () => void;
};

export type CreateHeadControllerOptions = {
    initial?: HeadPatch;
};

export function createHeadController(options: CreateHeadControllerOptions = {}): HeadController {
    const order: string[] = [];
    const patches = new Map<string, HeadPatch>();
    const listeners = new Set<(snapshot: HeadSnapshot) => void>();
    let disposedFlag = false;

    if (options.initial) {
        order.push("root");
        patches.set("root", options.initial);
    }

    const get = (): HeadSnapshot => {
        return mergePatches(order.map((id) => patches.get(id)!).filter(Boolean));
    };

    const emit = (): void => {
        const snapshot = get();
        for (const listener of listeners) {
            listener(snapshot);
        }
    };

    return {
        get,
        set(id, patch) {
            if (disposedFlag) {
                return;
            }
            if (!patches.has(id)) {
                order.push(id);
            }
            patches.set(id, patch);
            emit();
        },
        remove(id) {
            if (disposedFlag) {
                return;
            }
            if (!patches.has(id)) {
                return;
            }
            patches.delete(id);
            const idx = order.indexOf(id);
            if (idx >= 0) {
                order.splice(idx, 1);
            }
            emit();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposedFlag;
        },
        dispose() {
            if (disposedFlag) {
                return;
            }
            disposedFlag = true;
            listeners.clear();
            patches.clear();
            order.length = 0;
        },
    };
}
