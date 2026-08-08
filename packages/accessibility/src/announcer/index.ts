import type { Disposable } from "@sometic/core/disposable";
import { resolveDocument } from "../dom.js";

export type AriaLivePoliteness = "polite" | "assertive";

export type LiveAnnouncerOptions = {
    ownerDocument?: Document | (() => Document | undefined | null);
    politeness?: AriaLivePoliteness;
};

export type LiveAnnouncer = Disposable & {
    announce(
        message: string,
        options?: { politeness?: AriaLivePoliteness; clearDelayMs?: number },
    ): void;
    clear(): void;
};

export function createLiveAnnouncer(options: LiveAnnouncerOptions = {}): LiveAnnouncer {
    let region: HTMLElement | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const defaultPoliteness = options.politeness ?? "polite";

    const ensureRegion = (politeness: AriaLivePoliteness): HTMLElement | undefined => {
        const doc = resolveDocument(options.ownerDocument);
        if (!doc?.body) {
            return undefined;
        }
        if (region?.isConnected) {
            region.setAttribute("aria-live", politeness);
            return region;
        }
        const element = doc.createElement("div");
        element.setAttribute("aria-live", politeness);
        element.setAttribute("aria-atomic", "true");
        element.setAttribute("role", "status");
        element.style.position = "absolute";
        element.style.width = "1px";
        element.style.height = "1px";
        element.style.padding = "0";
        element.style.margin = "-1px";
        element.style.overflow = "hidden";
        element.style.clip = "rect(0, 0, 0, 0)";
        element.style.whiteSpace = "nowrap";
        element.style.border = "0";
        doc.body.appendChild(element);
        region = element;
        return region;
    };

    const clear = (): void => {
        if (clearTimer !== undefined) {
            clearTimeout(clearTimer);
            clearTimer = undefined;
        }
        if (region) {
            region.textContent = "";
        }
    };

    return {
        announce(message, announceOptions = {}) {
            if (disposed || message.trim().length === 0) {
                return;
            }
            const politeness = announceOptions.politeness ?? defaultPoliteness;
            const node = ensureRegion(politeness);
            if (!node) {
                return;
            }
            clear();
            node.textContent = message;
            const delay = announceOptions.clearDelayMs ?? 1000;
            clearTimer = setTimeout(() => {
                clear();
            }, delay);
        },
        clear,
        get disposed() {
            return disposed;
        },
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            clear();
            region?.remove();
            region = undefined;
        },
    };
}
