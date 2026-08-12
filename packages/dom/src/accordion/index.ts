import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { createDisposable, type Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type AccordionType = "single" | "multiple";

export type ResolveAccordionOptions = StyleableProps<"root"> & {
    type?: AccordionType;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type AccordionViewModel = {
    type: AccordionType;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveAccordion(options: ResolveAccordionOptions = {}): AccordionViewModel {
    const type = options.type ?? "single";
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        type,
        className: styled.className,
        style: styled.style,
        attributes: {
            "data-slot": "root",
            "data-type": type,
        },
    };
}

export type ResolveAccordionItemOptions = StyleableProps<"root"> & {
    value: string;
    open?: boolean;
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type AccordionItemViewModel = {
    value: string;
    open: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveAccordionItem(options: ResolveAccordionItemOptions): AccordionItemViewModel {
    const open = options.open === true;
    const disabled = options.disabled === true;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        value: options.value,
        open,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            "data-slot": "item",
            "data-state": open ? "open" : "closed",
            ...(disabled ? { "data-disabled": "", "aria-disabled": "true" } : {}),
        },
    };
}

export function shouldMountAccordionPanel(options: {
    open: boolean;
    lazyMount?: boolean;
    forceMount?: boolean;
}): boolean {
    if (options.forceMount === true) {
        return true;
    }
    if (options.lazyMount === true) {
        return options.open;
    }
    return true;
}

export type CreateAccordionControllerOptions = {
    type?: AccordionType;
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
};

export type AccordionController = {
    readonly type: AccordionType;
    readonly collapsible: boolean;
    readonly value: ControllableState<string | string[]>;
    resolve(options?: ResolveAccordionOptions): AccordionViewModel;
    resolveItem(options: Omit<ResolveAccordionItemOptions, "open">): AccordionItemViewModel;
    isOpen(item: string): boolean;
    toggle(item: string): void;
    setValue(value: string | string[]): void;
};

export function createAccordionController(
    options: CreateAccordionControllerOptions = {},
): AccordionController {
    const type = options.type ?? "single";
    const collapsible = options.collapsible !== false;
    const defaultValue = options.defaultValue ?? (type === "multiple" ? ([] as string[]) : "");
    const value = createControllableState<string | string[]>({
        defaultValue,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    const isOpen = (item: string): boolean => {
        const current = value.get();
        return Array.isArray(current) ? current.includes(item) : current === item;
    };

    return {
        type,
        collapsible,
        value,
        resolve(styleOptions = {}) {
            return resolveAccordion({ ...styleOptions, type });
        },
        resolveItem(itemOptions) {
            return resolveAccordionItem({
                ...itemOptions,
                open: isOpen(itemOptions.value),
            });
        },
        isOpen,
        toggle(item) {
            if (type === "multiple") {
                const current = value.get();
                const list = Array.isArray(current) ? [...current] : [];
                const idx = list.indexOf(item);
                if (idx >= 0) {
                    list.splice(idx, 1);
                } else {
                    list.push(item);
                }
                value.set(list);
                return;
            }
            if (isOpen(item)) {
                if (collapsible) {
                    value.set("");
                }
                return;
            }
            value.set(item);
        },
        setValue(next) {
            value.set(next);
        },
    };
}

export type AccordionKeyboardItem = {
    value: string;
    disabled?: boolean;
    trigger?: HTMLElement | null;
};

export type BindAccordionKeyboardOptions = {
    getItems: () => AccordionKeyboardItem[];
    toggle: (value: string) => void;
    loop?: boolean;
};

export function getAccordionKeyboardAction(
    event: Pick<KeyboardEvent, "key">,
    options: {
        items: AccordionKeyboardItem[];
        currentValue: string;
        loop?: boolean;
    },
): { focus?: string; toggle?: string } | undefined {
    const key = event.key;
    const enabled = options.items.filter((item) => item.disabled !== true);
    if (enabled.length === 0) {
        return undefined;
    }
    const currentIndex = enabled.findIndex((item) => item.value === options.currentValue);
    const loop = options.loop !== false;

    if (key === "Enter" || key === " ") {
        return { toggle: options.currentValue };
    }
    if (key === "ArrowDown" || key === "ArrowRight") {
        let next = currentIndex + 1;
        if (loop) {
            next = ((next % enabled.length) + enabled.length) % enabled.length;
        } else {
            next = Math.min(enabled.length - 1, Math.max(0, next));
        }
        const focus = enabled[next]?.value;
        return focus === undefined ? undefined : { focus };
    }
    if (key === "ArrowUp" || key === "ArrowLeft") {
        let next = currentIndex - 1;
        if (loop) {
            next = ((next % enabled.length) + enabled.length) % enabled.length;
        } else {
            next = Math.min(enabled.length - 1, Math.max(0, next));
        }
        const focus = enabled[next]?.value;
        return focus === undefined ? undefined : { focus };
    }
    if (key === "Home") {
        const focus = enabled[0]?.value;
        return focus === undefined ? undefined : { focus };
    }
    if (key === "End") {
        const focus = enabled[enabled.length - 1]?.value;
        return focus === undefined ? undefined : { focus };
    }
    return undefined;
}

export function bindAccordionKeyboard(options: BindAccordionKeyboardOptions): Disposable {
    const onKeyDown = (event: Event): void => {
        if (!(event instanceof KeyboardEvent)) {
            return;
        }
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const items = options.getItems();
        const match = items.find((item) => item.trigger === target);
        if (!match) {
            return;
        }
        const action = getAccordionKeyboardAction(event, {
            items,
            currentValue: match.value,
            ...(options.loop === undefined ? {} : { loop: options.loop }),
        });
        if (!action) {
            return;
        }
        if (action.toggle) {
            event.preventDefault();
            options.toggle(action.toggle);
            return;
        }
        if (action.focus) {
            event.preventDefault();
            const next = items.find((item) => item.value === action.focus);
            next?.trigger?.focus();
        }
    };

    for (const item of options.getItems()) {
        item.trigger?.addEventListener("keydown", onKeyDown);
    }

    return createDisposable(() => {
        for (const item of options.getItems()) {
            item.trigger?.removeEventListener("keydown", onKeyDown);
        }
    });
}
