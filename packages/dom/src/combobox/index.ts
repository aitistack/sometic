import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveComboboxOptions = StyleableProps<"root"> & {
    open?: boolean;
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type ComboboxViewModel = {
    open: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveCombobox(options: ResolveComboboxOptions = {}): ComboboxViewModel {
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
        open,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "combobox",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            "aria-expanded": open ? "true" : "false",
            "aria-haspopup": "listbox",
            ...(disabled ? { "aria-disabled": "true" } : {}),
        },
    };
}

export type ResolveComboboxListOptions = StyleableProps<"root"> & {
    open?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export function resolveComboboxList(options: ResolveComboboxListOptions = {}) {
    const open = options.open === true;
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
    const attributes: Record<string, string> = {
        role: "listbox",
        "data-slot": "list",
        "data-state": open ? "open" : "closed",
    };
    if (!open) {
        attributes.hidden = "";
    }
    return {
        open,
        className: styled.className,
        style: styled.style,
        attributes,
    };
}

export type ResolveComboboxOptionOptions = StyleableProps<"root"> & {
    value: string;
    selected?: boolean;
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export function resolveComboboxOption(options: ResolveComboboxOptionOptions) {
    const selected = options.selected === true;
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
        selected,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "option",
            "data-slot": "option",
            "data-state": selected ? "checked" : "unchecked",
            "aria-selected": selected ? "true" : "false",
            ...(disabled ? { "aria-disabled": "true" } : {}),
        },
    };
}

export type CreateComboboxControllerOptions = {
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
};

export type ComboboxController = {
    readonly value: ControllableState<string | null>;
    readonly open: ControllableState<boolean>;
    readonly inputValue: ControllableState<string>;
    resolve(options?: Omit<ResolveComboboxOptions, "open">): ReturnType<typeof resolveCombobox>;
    resolveList(
        options?: Omit<ResolveComboboxListOptions, "open">,
    ): ReturnType<typeof resolveComboboxList>;
    resolveOption(
        options: Omit<ResolveComboboxOptionOptions, "selected">,
    ): ReturnType<typeof resolveComboboxOption>;
    setValue(value: string | null): void;
    setOpen(open: boolean): void;
    setInputValue(value: string): void;
};

export function createComboboxController(
    options: CreateComboboxControllerOptions = {},
): ComboboxController {
    const value = createControllableState<string | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    const open = createControllableState<boolean>({
        defaultValue: options.defaultOpen ?? false,
        ...(options.open === undefined ? {} : { value: options.open }),
        ...(options.onOpenChange === undefined ? {} : { onChange: options.onOpenChange }),
    });
    const inputValue = createControllableState<string>({
        defaultValue: options.defaultInputValue ?? "",
        ...(options.inputValue === undefined ? {} : { value: options.inputValue }),
        ...(options.onInputValueChange === undefined
            ? {}
            : { onChange: options.onInputValueChange }),
    });
    return {
        value,
        open,
        inputValue,
        resolve(styleOptions = {}) {
            return resolveCombobox({ ...styleOptions, open: open.get() });
        },
        resolveList(styleOptions = {}) {
            return resolveComboboxList({ ...styleOptions, open: open.get() });
        },
        resolveOption(optionOptions) {
            return resolveComboboxOption({
                ...optionOptions,
                selected: value.get() === optionOptions.value,
            });
        },
        setValue(next) {
            value.set(next);
        },
        setOpen(next) {
            open.set(next);
        },
        setInputValue(next) {
            inputValue.set(next);
        },
    };
}
