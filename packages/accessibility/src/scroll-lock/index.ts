import type { Disposable } from "@sometic/core/disposable";
import { resolveDocument } from "../dom.js";

type LockState = {
    count: number;
    previousOverflow: string;
    previousPaddingRight: string;
};

const locks = new WeakMap<Document, LockState>();

export type LockBodyScrollOptions = {
    ownerDocument?: Document | (() => Document | undefined | null);
};

export function lockBodyScroll(options: LockBodyScrollOptions = {}): Disposable {
    const doc = resolveDocument(options.ownerDocument);
    if (!doc?.body) {
        return {
            disposed: true,
            dispose() {
                return;
            },
        };
    }

    let state = locks.get(doc);
    if (!state) {
        const body = doc.body;
        const scrollbarGap = Math.max(0, globalThis.innerWidth - doc.documentElement.clientWidth);
        state = {
            count: 0,
            previousOverflow: body.style.overflow,
            previousPaddingRight: body.style.paddingRight,
        };
        body.style.overflow = "hidden";
        if (scrollbarGap > 0) {
            const currentPadding =
                Number.parseFloat(globalThis.getComputedStyle(body).paddingRight) || 0;
            body.style.paddingRight = `${currentPadding + scrollbarGap}px`;
        }
        locks.set(doc, state);
    }

    state.count += 1;
    let disposed = false;

    return {
        get disposed() {
            return disposed;
        },
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            const current = locks.get(doc);
            if (!current) {
                return;
            }
            current.count -= 1;
            if (current.count > 0) {
                return;
            }
            doc.body.style.overflow = current.previousOverflow;
            doc.body.style.paddingRight = current.previousPaddingRight;
            locks.delete(doc);
        },
    };
}
