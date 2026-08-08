import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
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

export type CreateAccordionControllerOptions = {
    type?: AccordionType;
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
};

export type AccordionController = {
    readonly type: AccordionType;
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
            value.set(isOpen(item) ? "" : item);
        },
        setValue(next) {
            value.set(next);
        },
    };
}
