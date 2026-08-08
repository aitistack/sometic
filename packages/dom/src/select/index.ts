import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type ResolveSelectOptions = StyleableProps<"root"> & {
    value?: string | null;
    options?: readonly SelectOption[];
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    name?: string;
    multiple?: boolean;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type SelectViewModel = {
    value: string | null;
    options: readonly SelectOption[];
    disabled: boolean;
    required: boolean;
    invalid: boolean;
    multiple: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    nativeAttributes: Record<string, string>;
};

export function resolveSelect(options: ResolveSelectOptions = {}): SelectViewModel {
    const value = options.value ?? null;
    const list = options.options ?? [];
    const disabled = options.disabled === true;
    const required = options.required === true;
    const invalid = options.invalid === true;
    const multiple = options.multiple === true;
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
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });
    return {
        value,
        options: list,
        disabled,
        required,
        invalid,
        multiple,
        className: styled.className,
        style: styled.style,
        attributes: {
            ...state,
            "data-slot": "root",
            ...(invalid ? { "aria-invalid": "true" } : {}),
        },
        nativeAttributes: {
            ...(options.name ? { name: options.name } : {}),
            ...(disabled ? { disabled: "" } : {}),
            ...(required ? { required: "" } : {}),
            ...(multiple ? { multiple: "" } : {}),
        },
    };
}

export type CreateSelectControllerOptions = {
    value?: string | null;
    defaultValue?: string | null;
    options?: readonly SelectOption[];
    onValueChange?: (value: string | null) => void;
};

export type SelectController = {
    readonly value: ControllableState<string | null>;
    readonly options: readonly SelectOption[];
    resolve(options?: Omit<ResolveSelectOptions, "value" | "options">): SelectViewModel;
    setValue(value: string | null): void;
};

export function createSelectController(
    options: CreateSelectControllerOptions = {},
): SelectController {
    const value = createControllableState<string | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    const list = options.options ?? [];

    return {
        value,
        options: list,
        resolve(styleOptions = {}) {
            return resolveSelect({
                ...styleOptions,
                value: value.get(),
                options: list,
            });
        },
        setValue(next) {
            value.set(next);
        },
    };
}

export type BindSelectOptions = ResolveSelectOptions & {
    onValueChange?: (value: string | null) => void;
};

export function bindSelect(
    element: HTMLSelectElement,
    getOptions: () => BindSelectOptions,
): Disposable {
    const apply = (): void => {
        const options = getOptions();
        const view = resolveSelect({
            ...options,
            value: options.value ?? (element.value || null),
        });
        element.className = view.className;
        for (const [key, value] of Object.entries(view.style)) {
            element.style.setProperty(key, value);
        }
        for (const [key, value] of Object.entries(view.attributes)) {
            element.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            element.setAttribute(key, value);
        }
        element.disabled = view.disabled;
        element.required = view.required;
        element.multiple = view.multiple;
        if (view.options.length > 0) {
            element.replaceChildren(
                ...view.options.map((option) => {
                    const node = document.createElement("option");
                    node.value = option.value;
                    node.textContent = option.label;
                    node.disabled = option.disabled === true;
                    return node;
                }),
            );
        }
        if (view.value !== null) {
            element.value = view.value;
        }
    };

    const onChange = (): void => {
        const options = getOptions();
        options.onValueChange?.(element.value === "" ? null : element.value);
        apply();
    };

    apply();
    element.addEventListener("change", onChange);
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
            element.removeEventListener("change", onChange);
        },
    };
}
