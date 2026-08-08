import type { Disposable } from "@sometic/core/disposable";
import { resolveElement } from "../dom.js";

export type DismissReason = "escape-key" | "outside-press";

export type DismissableLayerOptions = {
    getElement: () => HTMLElement | null | undefined;
    onDismiss: (reason: DismissReason) => void;
    escapeDeactivates?: boolean;
    outsidePress?: boolean;
};

export type DismissableLayer = Disposable & {
    activate(): void;
    deactivate(): void;
    readonly active: boolean;
};

type LayerRecord = {
    escapeDeactivates: boolean;
    outsidePress: boolean;
    getElement: () => HTMLElement | null | undefined;
    onDismiss: (reason: DismissReason) => void;
    api: DismissableLayer;
};

const layerStack: LayerRecord[] = [];
let removeGlobal: (() => void) | undefined;

function ensureGlobalListeners(): void {
    if (removeGlobal) {
        return;
    }
    const doc = globalThis.document;
    if (!doc) {
        return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== "Escape") {
            return;
        }
        const top = layerStack[layerStack.length - 1];
        if (!top || !top.escapeDeactivates) {
            return;
        }
        event.preventDefault();
        top.onDismiss("escape-key");
    };

    const onPointerDown = (event: Event): void => {
        const top = layerStack[layerStack.length - 1];
        if (!top || !top.outsidePress) {
            return;
        }
        const element = resolveElement(top.getElement);
        const target = event.target;
        if (element && target instanceof Node && element.contains(target)) {
            return;
        }
        top.onDismiss("outside-press");
    };

    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("pointerdown", onPointerDown, true);
    removeGlobal = () => {
        doc.removeEventListener("keydown", onKeyDown, true);
        doc.removeEventListener("pointerdown", onPointerDown, true);
        removeGlobal = undefined;
    };
}

function teardownGlobalListenersIfEmpty(): void {
    if (layerStack.length === 0) {
        removeGlobal?.();
    }
}

export function createDismissableLayer(options: DismissableLayerOptions): DismissableLayer {
    let active = false;
    const record: LayerRecord = {
        escapeDeactivates: options.escapeDeactivates !== false,
        outsidePress: options.outsidePress !== false,
        getElement: options.getElement,
        onDismiss: options.onDismiss,
        api: null as unknown as DismissableLayer,
    };

    const api: DismissableLayer = {
        get active() {
            return active;
        },
        activate() {
            if (active) {
                return;
            }
            active = true;
            layerStack.push(record);
            ensureGlobalListeners();
        },
        deactivate() {
            if (!active) {
                return;
            }
            active = false;
            const index = layerStack.indexOf(record);
            if (index >= 0) {
                layerStack.splice(index, 1);
            }
            teardownGlobalListenersIfEmpty();
        },
        get disposed() {
            return !active;
        },
        dispose() {
            api.deactivate();
        },
    };

    record.api = api;
    return api;
}
