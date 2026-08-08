import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { createSlotAttributes, defineSlots, pickSlotValue } from "@sometic/styling/slots";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import type { Disposable } from "@sometic/core/disposable";

export const BUTTON_SLOTS = defineSlots(["root", "prefix", "content", "suffix", "loader"] as const);

export type ButtonSlot = (typeof BUTTON_SLOTS)[number];

export type ButtonType = "button" | "submit" | "reset";

export type ResolveButtonOptions = StyleableProps<ButtonSlot> & {
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    name?: string;
    value?: string;
    form?: string;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type ButtonSlotView = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ButtonViewModel = {
    type: ButtonType;
    disabled: boolean;
    loading: boolean;
    nativeDisabled: boolean;
    shouldIgnorePress: boolean;
    name?: string;
    value?: string;
    form?: string;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    slots: Record<ButtonSlot, ButtonSlotView>;
};

function resolveSlotView(
    slot: ButtonSlot,
    options: ResolveButtonOptions,
    stateClassName: ClassValue | undefined,
): ButtonSlotView {
    const userClass = pickSlotValue(options.classes, slot);
    const userStyle = pickSlotValue(options.styles, slot);
    const isRoot = slot === "root";
    const resolved = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(isRoot && options.defaults !== undefined ? { defaults: options.defaults } : {}),
        ...(isRoot && options.variants !== undefined ? { variants: options.variants } : {}),
        ...(isRoot && stateClassName !== undefined ? { state: { className: stateClassName } } : {}),
        ...(userClass !== undefined || userStyle !== undefined
            ? {
                  user: {
                      ...(userClass === undefined ? {} : { className: userClass }),
                      ...(userStyle === undefined ? {} : { style: userStyle }),
                  },
              }
            : {}),
        ...(isRoot && options.cssVariables !== undefined
            ? { cssVariables: options.cssVariables }
            : {}),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });

    return {
        className: resolved.className,
        style: resolved.style,
        attributes: createSlotAttributes(slot),
    };
}

export function resolveButton(options: ResolveButtonOptions = {}): ButtonViewModel {
    const loading = options.loading === true;
    const disabled = options.disabled === true || loading;
    const type = options.type ?? "button";
    const stateClassName = {
        "is-disabled": disabled,
        "is-loading": loading,
    };

    const root = resolveSlotView("root", options, stateClassName);
    const stateAttrs = resolveStateAttributes({
        disabled,
        loading,
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });

    const attributes: Record<string, string> = {
        ...root.attributes,
        ...stateAttrs,
    };
    if (loading) {
        attributes["aria-busy"] = "true";
    }

    const slots = {
        root,
        prefix: resolveSlotView("prefix", options, undefined),
        content: resolveSlotView("content", options, undefined),
        suffix: resolveSlotView("suffix", options, undefined),
        loader: resolveSlotView("loader", options, undefined),
    } satisfies Record<ButtonSlot, ButtonSlotView>;

    const view: ButtonViewModel = {
        type,
        disabled,
        loading,
        nativeDisabled: disabled,
        shouldIgnorePress: disabled,
        className: root.className,
        style: root.style,
        attributes,
        slots,
    };

    if (options.name !== undefined) {
        view.name = options.name;
    }
    if (options.value !== undefined) {
        view.value = options.value;
    }
    if (options.form !== undefined) {
        view.form = options.form;
    }

    return view;
}

export function handleButtonPress(
    view: Pick<ButtonViewModel, "shouldIgnorePress">,
    event: { preventDefault(): void },
    onPress?: (event: { preventDefault(): void }) => void,
): void {
    if (view.shouldIgnorePress) {
        event.preventDefault();
        return;
    }
    onPress?.(event);
}

export type BindButtonOptions = ResolveButtonOptions & {
    onPress?: (event: MouseEvent) => void;
};

export function bindButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
): Disposable {
    const apply = (): void => {
        const options = getOptions();
        const view = resolveButton(options);
        element.type = view.type;
        element.disabled = view.nativeDisabled;
        element.className = view.className;
        for (const [key, value] of Object.entries(view.style)) {
            element.style.setProperty(key, value);
        }
        for (const [key, value] of Object.entries(view.attributes)) {
            element.setAttribute(key, value);
        }
        if (view.name !== undefined) {
            element.name = view.name;
        }
        if (view.value !== undefined) {
            element.value = view.value;
        }
        if (view.form !== undefined) {
            element.setAttribute("form", view.form);
        }
    };

    const onClick = (event: MouseEvent): void => {
        const options = getOptions();
        const view = resolveButton(options);
        handleButtonPress(view, event, () => {
            options.onPress?.(event);
        });
    };

    apply();
    element.addEventListener("click", onClick);
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
            element.removeEventListener("click", onClick);
        },
    };
}
