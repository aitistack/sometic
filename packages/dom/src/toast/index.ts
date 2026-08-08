import { createPrefixedId } from "@sometic/core/id";
import type { Disposable } from "@sometic/core/disposable";
import {
    createLiveAnnouncer,
    type LiveAnnouncer,
    type AriaLivePoliteness,
} from "@sometic/accessibility/announcer";

export type ToastItem = {
    id: string;
    title: string;
    description?: string;
    durationMs: number;
    politeness: AriaLivePoliteness;
};

export type ToastInput = {
    title: string;
    description?: string;
    durationMs?: number;
    politeness?: AriaLivePoliteness;
};

export type CreateToastQueueOptions = {
    maxVisible?: number;
    defaultDurationMs?: number;
    onChange?: (items: readonly ToastItem[]) => void;
    announcer?: LiveAnnouncer;
};

export type ToastQueue = Disposable & {
    readonly items: readonly ToastItem[];
    push(input: ToastInput): ToastItem;
    dismiss(id: string): void;
    clear(): void;
};

export function createToastQueue(options: CreateToastQueueOptions = {}): ToastQueue {
    const maxVisible = options.maxVisible ?? 3;
    const defaultDurationMs = options.defaultDurationMs ?? 4000;
    const ownedAnnouncer = options.announcer === undefined;
    const announcer = options.announcer ?? createLiveAnnouncer();
    let items: ToastItem[] = [];
    let disposedFlag = false;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const emit = (): void => {
        options.onChange?.(items);
    };

    const dismiss = (id: string): void => {
        const timer = timers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            timers.delete(id);
        }
        const next = items.filter((item) => item.id !== id);
        if (next.length === items.length) {
            return;
        }
        items = next;
        emit();
    };

    return {
        get items() {
            return items;
        },
        push(input) {
            const item: ToastItem = {
                id: createPrefixedId("toast"),
                title: input.title,
                durationMs: input.durationMs ?? defaultDurationMs,
                politeness: input.politeness ?? "polite",
                ...(input.description === undefined ? {} : { description: input.description }),
            };
            items = [...items, item].slice(-maxVisible);
            emit();
            const message = item.description ? `${item.title}. ${item.description}` : item.title;
            announcer.announce(message, { politeness: item.politeness });
            if (item.durationMs > 0) {
                timers.set(
                    item.id,
                    setTimeout(() => {
                        dismiss(item.id);
                    }, item.durationMs),
                );
            }
            return item;
        },
        dismiss,
        clear() {
            for (const timer of timers.values()) {
                clearTimeout(timer);
            }
            timers.clear();
            items = [];
            emit();
        },
        get disposed() {
            return disposedFlag;
        },
        dispose() {
            if (disposedFlag) {
                return;
            }
            disposedFlag = true;
            for (const timer of timers.values()) {
                clearTimeout(timer);
            }
            timers.clear();
            items = [];
            if (ownedAnnouncer) {
                announcer.dispose();
            }
        },
    };
}
