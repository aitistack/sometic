import { createDisposable, type Disposable } from "@sometic/core/disposable";

export type KeyMatcher = {
    key: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    code?: string;
};

export type KeyBinding = KeyMatcher & {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    handler: (event: KeyboardEvent) => void;
};

export function matchesKey(event: KeyboardEvent, matcher: KeyMatcher): boolean {
    if (matcher.code !== undefined && event.code !== matcher.code) {
        return false;
    }
    if (event.key !== matcher.key) {
        return false;
    }
    if ((matcher.altKey ?? false) !== event.altKey) {
        return false;
    }
    if ((matcher.ctrlKey ?? false) !== event.ctrlKey) {
        return false;
    }
    if ((matcher.metaKey ?? false) !== event.metaKey) {
        return false;
    }
    if ((matcher.shiftKey ?? false) !== event.shiftKey) {
        return false;
    }
    return true;
}

export type CreateKeyboardBindingsOptions = {
    target?: EventTarget | (() => EventTarget | null | undefined);
    eventName?: "keydown" | "keyup";
};

export type KeyboardBindings = Disposable & {
    attach(): void;
    detach(): void;
    readonly attached: boolean;
};

export function createKeyboardBindings(
    bindings: readonly KeyBinding[],
    options: CreateKeyboardBindingsOptions = {},
): KeyboardBindings {
    let attached = false;
    let currentTarget: EventTarget | undefined;
    const eventName = options.eventName ?? "keydown";

    const listener = (event: Event): void => {
        if (!(event instanceof KeyboardEvent)) {
            return;
        }
        for (const binding of bindings) {
            if (!matchesKey(event, binding)) {
                continue;
            }
            if (binding.preventDefault) {
                event.preventDefault();
            }
            if (binding.stopPropagation) {
                event.stopPropagation();
            }
            binding.handler(event);
            break;
        }
    };

    const resolveTarget = (): EventTarget | undefined => {
        const value = options.target;
        if (typeof value === "function") {
            return value() ?? undefined;
        }
        if (value) {
            return value;
        }
        return globalThis.document;
    };

    const attach = (): void => {
        if (attached) {
            return;
        }
        const target = resolveTarget();
        if (!target) {
            return;
        }
        currentTarget = target;
        target.addEventListener(eventName, listener);
        attached = true;
    };

    const detach = (): void => {
        if (!attached || !currentTarget) {
            attached = false;
            currentTarget = undefined;
            return;
        }
        currentTarget.removeEventListener(eventName, listener);
        attached = false;
        currentTarget = undefined;
    };

    return {
        get attached() {
            return attached;
        },
        attach,
        detach,
        get disposed() {
            return !attached;
        },
        dispose() {
            detach();
        },
    };
}

export function onKey(
    target: EventTarget,
    binding: KeyBinding,
    eventName: "keydown" | "keyup" = "keydown",
): Disposable {
    const controller = createKeyboardBindings([binding], { target, eventName });
    controller.attach();
    return createDisposable(() => {
        controller.dispose();
    });
}
