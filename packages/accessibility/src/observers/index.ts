import type { Disposable } from "@sometic/core/disposable";
import { resolveElement } from "../dom.js";

function noopDisposable(): Disposable {
    return {
        disposed: true,
        dispose() {
            return;
        },
    };
}

export function observeResize(
    target: Element | (() => Element | null | undefined),
    callback: ResizeObserverCallback,
    options?: ResizeObserverOptions,
): Disposable {
    const ResizeObserverCtor = globalThis.ResizeObserver;
    const element = resolveElement(target);
    if (typeof ResizeObserverCtor !== "function" || !element) {
        return noopDisposable();
    }
    const observer = new ResizeObserverCtor(callback);
    observer.observe(element, options);
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
            observer.disconnect();
        },
    };
}

export function observeIntersection(
    target: Element | (() => Element | null | undefined),
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
): Disposable {
    const IntersectionObserverCtor = globalThis.IntersectionObserver;
    const element = resolveElement(target);
    if (typeof IntersectionObserverCtor !== "function" || !element) {
        return noopDisposable();
    }
    const observer = new IntersectionObserverCtor(callback, options);
    observer.observe(element);
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
            observer.disconnect();
        },
    };
}

export function observeMutations(
    target: Node | (() => Node | null | undefined),
    callback: MutationCallback,
    options: MutationObserverInit,
): Disposable {
    const MutationObserverCtor = globalThis.MutationObserver;
    const node = typeof target === "function" ? (target() ?? undefined) : (target ?? undefined);
    if (typeof MutationObserverCtor !== "function" || !node) {
        return noopDisposable();
    }
    const observer = new MutationObserverCtor(callback);
    observer.observe(node, options);
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
            observer.disconnect();
        },
    };
}
