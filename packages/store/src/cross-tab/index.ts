import { createId } from "@sometic/core/id";
import { createStore } from "../create-store.js";
import type { DisposableStore, StoreEqualityFn } from "../types.js";

export type CrossTabTransport = {
    post(message: CrossTabMessage): void;
    subscribe(listener: (message: CrossTabMessage) => void): () => void;
    dispose(): void;
};

export type CrossTabMessage = {
    readonly sourceId: string;
    readonly key: string;
    readonly revision: number;
    readonly state: unknown;
    readonly electedAt?: number;
};

export type CrossTabConflictPolicy = "lww" | "leader";

export type CreateCrossTabStoreOptions<TState> = {
    key: string;
    equalityFn?: StoreEqualityFn<TState>;
    transport?: CrossTabTransport;
    shouldAccept?: (message: CrossTabMessage, currentRevision: number) => boolean;
    conflictPolicy?: CrossTabConflictPolicy;
};

export type CrossTabStore<TState> = DisposableStore<TState> & {
    readonly sourceId: string;
    readonly revision: number;
    readonly electedAt: number;
};

export function createBroadcastChannelTransport(channelName: string): CrossTabTransport {
    const candidate = globalThis as {
        BroadcastChannel?: new (name: string) => BroadcastChannel;
    };

    if (typeof candidate.BroadcastChannel !== "function") {
        return createNoopTransport();
    }

    const channel = new candidate.BroadcastChannel(channelName);
    const listeners = new Set<(message: CrossTabMessage) => void>();

    const onMessage = (event: MessageEvent<CrossTabMessage>) => {
        const data = event.data;
        if (!data || typeof data !== "object" || typeof data.sourceId !== "string") {
            return;
        }

        for (const listener of listeners) {
            listener(data);
        }
    };

    channel.addEventListener("message", onMessage);

    return {
        post(message) {
            channel.postMessage(message);
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            listeners.clear();
            channel.removeEventListener("message", onMessage);
            channel.close();
        },
    };
}

export function createStorageEventTransport(storageKey: string): CrossTabTransport {
    const listeners = new Set<(message: CrossTabMessage) => void>();

    const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey || event.newValue === null) {
            return;
        }

        try {
            const parsed = JSON.parse(event.newValue) as CrossTabMessage;
            if (!parsed || typeof parsed.sourceId !== "string") {
                return;
            }

            for (const listener of listeners) {
                listener(parsed);
            }
        } catch {
            return;
        }
    };

    const candidate = globalThis as {
        addEventListener?: typeof addEventListener;
        removeEventListener?: typeof removeEventListener;
        localStorage?: Storage;
    };

    if (typeof candidate.addEventListener === "function") {
        candidate.addEventListener("storage", onStorage as EventListener);
    }

    return {
        post(message) {
            if (!candidate.localStorage) {
                return;
            }

            try {
                candidate.localStorage.setItem(storageKey, JSON.stringify(message));
                candidate.localStorage.removeItem(storageKey);
            } catch {
                return;
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
            if (typeof candidate.removeEventListener === "function") {
                candidate.removeEventListener("storage", onStorage as EventListener);
            }
        },
    };
}

function createNoopTransport(): CrossTabTransport {
    return {
        post() {
            return;
        },
        subscribe() {
            return () => undefined;
        },
        dispose() {
            return;
        },
    };
}

export function createCrossTabStore<TState>(
    initialState: TState,
    options: CreateCrossTabStoreOptions<TState>,
): CrossTabStore<TState> {
    const sourceId = createId();
    const electedAt = Date.now();
    const store = createStore(
        initialState,
        options.equalityFn ? { equalityFn: options.equalityFn } : {},
    );
    const transport =
        options.transport ??
        (typeof (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel === "function"
            ? createBroadcastChannelTransport(`sometic:${options.key}`)
            : createStorageEventTransport(`sometic:cross-tab:${options.key}`));

    let revision = 0;
    let applyingRemote = false;

    const conflictPolicy = options.conflictPolicy ?? "lww";

    const defaultShouldAccept = (message: CrossTabMessage, currentRevision: number): boolean => {
        if (conflictPolicy === "leader") {
            const remoteElectedAt = message.electedAt ?? Number.POSITIVE_INFINITY;
            const localIsLeader = electedAt <= remoteElectedAt;
            if (localIsLeader || currentRevision > message.revision) {
                return false;
            }
            return message.revision > currentRevision;
        }
        return message.revision > currentRevision;
    };

    const shouldAccept = options.shouldAccept ?? defaultShouldAccept;

    const unsubscribeTransport = transport.subscribe((message) => {
        if (message.sourceId === sourceId || message.key !== options.key) {
            return;
        }

        if (!shouldAccept(message, revision)) {
            return;
        }

        applyingRemote = true;
        try {
            revision = message.revision;
            store.set(message.state as TState);
        } finally {
            applyingRemote = false;
        }
    });

    const unsubscribeStore = store.subscribe((state) => {
        if (applyingRemote) {
            return;
        }

        revision += 1;
        transport.post({
            sourceId,
            key: options.key,
            revision,
            state,
            electedAt,
        });
    });

    return {
        get sourceId() {
            return sourceId;
        },
        get revision() {
            return revision;
        },
        get electedAt() {
            return electedAt;
        },
        get disposed() {
            return store.disposed;
        },
        get: store.get.bind(store),
        set: store.set.bind(store),
        update: store.update.bind(store),
        batch: store.batch.bind(store),
        subscribe: store.subscribe.bind(store),
        dispose() {
            unsubscribeStore();
            unsubscribeTransport();
            transport.dispose();
            store.dispose();
        },
    };
}
