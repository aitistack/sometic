import type { Disposable } from "@sometic/core/disposable";
import { resolveElement } from "../dom.js";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "object",
    "embed",
    "[contenteditable]:not([contenteditable='false'])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

function isElementVisible(element: HTMLElement): boolean {
    return (
        element.getClientRects().length > 0 ||
        element.offsetParent !== null ||
        element === element.ownerDocument.body
    );
}

export function getFocusableElements(container: ParentNode): HTMLElement[] {
    const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    return [...nodes].filter((element) => {
        if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
            return false;
        }
        return isElementVisible(element);
    });
}

export function getTabbableElements(container: ParentNode): HTMLElement[] {
    return getFocusableElements(container).filter((element) => {
        const tabIndex = element.tabIndex;
        return tabIndex >= 0;
    });
}

export type FocusTrapOptions = {
    container: HTMLElement | (() => HTMLElement | null | undefined);
    loop?: boolean;
    initialFocus?: HTMLElement | (() => HTMLElement | null | undefined) | "first" | "container";
    returnFocus?: boolean;
};

export type FocusTrap = Disposable & {
    activate(): void;
    deactivate(): void;
    readonly active: boolean;
};

export function createFocusTrap(options: FocusTrapOptions): FocusTrap {
    let active = false;
    let disposed = false;
    let previouslyFocused: HTMLElement | null = null;
    let removeKeydown: (() => void) | undefined;

    const loop = options.loop !== false;
    const shouldReturnFocus = options.returnFocus !== false;

    const activate = (): void => {
        if (active || disposed) {
            return;
        }
        const container = resolveElement(options.container);
        if (!container) {
            return;
        }

        const doc = container.ownerDocument;
        const activeElement = doc.activeElement;
        previouslyFocused = activeElement instanceof HTMLElement ? activeElement : null;

        active = true;

        const initial = options.initialFocus;
        if (initial === "container") {
            if (!container.hasAttribute("tabindex")) {
                container.tabIndex = -1;
            }
            container.focus();
        } else if (initial === "first" || initial === undefined) {
            const tabbables = getTabbableElements(container);
            (tabbables[0] ?? container).focus();
        } else {
            const target = resolveElement(initial);
            (target ?? getTabbableElements(container)[0] ?? container).focus();
        }

        const onKeyDown = (event: KeyboardEvent): void => {
            if (!active || event.key !== "Tab") {
                return;
            }
            const current = resolveElement(options.container);
            if (!current) {
                return;
            }
            const tabbables = getTabbableElements(current);
            if (tabbables.length === 0) {
                event.preventDefault();
                current.focus();
                return;
            }
            const first = tabbables[0]!;
            const last = tabbables[tabbables.length - 1]!;
            const focused = doc.activeElement;
            if (event.shiftKey) {
                if (focused === first || focused === current) {
                    if (loop) {
                        event.preventDefault();
                        last.focus();
                    }
                }
                return;
            }
            if (focused === last) {
                if (loop) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        doc.addEventListener("keydown", onKeyDown, true);
        removeKeydown = () => {
            doc.removeEventListener("keydown", onKeyDown, true);
        };
    };

    const deactivate = (): void => {
        if (!active) {
            return;
        }
        active = false;
        removeKeydown?.();
        removeKeydown = undefined;
        if (shouldReturnFocus && previouslyFocused && previouslyFocused.isConnected) {
            previouslyFocused.focus();
        }
        previouslyFocused = null;
    };

    return {
        get active() {
            return active;
        },
        activate,
        deactivate,
        get disposed() {
            return disposed;
        },
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            deactivate();
        },
    };
}

export function createFocusScope(options: FocusTrapOptions): FocusTrap {
    return createFocusTrap(options);
}
