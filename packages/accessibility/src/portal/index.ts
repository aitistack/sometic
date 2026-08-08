import type { Disposable } from "@sometic/core/disposable";
import { resolveDocument, resolveElement } from "../dom.js";

export type PortalRootOptions = {
    id?: string;
    ownerDocument?: Document | (() => Document | undefined | null);
    container?: HTMLElement | (() => HTMLElement | null | undefined);
};

export type PortalRoot = Disposable & {
    ensure(): HTMLElement | undefined;
    getElement(): HTMLElement | undefined;
};

export function createPortalRoot(options: PortalRootOptions = {}): PortalRoot {
    let node: HTMLElement | undefined;
    let created = false;

    const ensure = (): HTMLElement | undefined => {
        if (node?.isConnected) {
            return node;
        }
        const explicit = resolveElement(options.container);
        if (explicit) {
            node = explicit;
            created = false;
            return node;
        }
        const doc = resolveDocument(options.ownerDocument);
        if (!doc?.body) {
            return undefined;
        }
        const existingId = options.id;
        if (existingId) {
            const existing = doc.getElementById(existingId);
            if (existing instanceof HTMLElement) {
                node = existing;
                created = false;
                return node;
            }
        }
        const element = doc.createElement("div");
        if (existingId) {
            element.id = existingId;
        }
        element.setAttribute("data-sometic-portal", "");
        doc.body.appendChild(element);
        node = element;
        created = true;
        return node;
    };

    return {
        ensure,
        getElement() {
            return node?.isConnected ? node : undefined;
        },
        get disposed() {
            return node === undefined;
        },
        dispose() {
            if (created && node?.isConnected) {
                node.remove();
            }
            node = undefined;
            created = false;
        },
    };
}
