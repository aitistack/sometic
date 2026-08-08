import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveRadioOptions = StyleableProps<"root"> & {
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    name?: string;
    value: string;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type RadioViewModel = {
    checked: boolean;
    disabled: boolean;
    required: boolean;
    invalid: boolean;
    value: string;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    nativeAttributes: Record<string, string>;
};

export function resolveRadio(options: ResolveRadioOptions): RadioViewModel {
    const checked = options.checked === true;
    const disabled = options.disabled === true;
    const required = options.required === true;
    const invalid = options.invalid === true;
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
    const state = resolveStateAttributes({
        disabled,
        invalid,
        checked,
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });
    return {
        checked,
        disabled,
        required,
        invalid,
        value: options.value,
        className: styled.className,
        style: styled.style,
        attributes: {
            ...state,
            "data-slot": "root",
            "aria-checked": checked ? "true" : "false",
            ...(invalid ? { "aria-invalid": "true" } : {}),
        },
        nativeAttributes: {
            type: "radio",
            value: options.value,
            ...(options.name ? { name: options.name } : {}),
            ...(disabled ? { disabled: "" } : {}),
            ...(required ? { required: "" } : {}),
        },
    };
}

export type CreateRadioGroupControllerOptions = {
    value?: string | null;
    defaultValue?: string | null;
    name?: string;
    onValueChange?: (value: string | null) => void;
};

export type RadioGroupController = {
    readonly value: ControllableState<string | null>;
    readonly name?: string;
    resolveItem(
        itemValue: string,
        options?: Omit<ResolveRadioOptions, "value" | "checked" | "name">,
    ): RadioViewModel;
    setValue(value: string | null): void;
};

export function createRadioGroupController(
    options: CreateRadioGroupControllerOptions = {},
): RadioGroupController {
    const value = createControllableState<string | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        ...(options.name === undefined ? {} : { name: options.name }),
        resolveItem(itemValue, styleOptions = {}) {
            return resolveRadio({
                ...styleOptions,
                value: itemValue,
                checked: value.get() === itemValue,
                ...(options.name === undefined ? {} : { name: options.name }),
            });
        },
        setValue(next) {
            value.set(next);
        },
    };
}
