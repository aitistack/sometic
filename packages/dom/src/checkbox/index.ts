import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveCheckboxOptions = StyleableProps<"root"> & {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    name?: string;
    value?: string;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type CheckboxViewModel = {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    required: boolean;
    invalid: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    nativeAttributes: Record<string, string>;
};

export function resolveCheckbox(options: ResolveCheckboxOptions = {}): CheckboxViewModel {
    const checked = options.checked === true;
    const indeterminate = options.indeterminate === true;
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
        checked: indeterminate ? "indeterminate" : checked,
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });
    const ariaChecked = indeterminate ? "mixed" : checked ? "true" : "false";
    return {
        checked,
        indeterminate,
        disabled,
        required,
        invalid,
        className: styled.className,
        style: styled.style,
        attributes: {
            ...state,
            "data-slot": "root",
            "data-indeterminate": indeterminate ? "true" : "false",
            "aria-checked": ariaChecked,
            ...(invalid ? { "aria-invalid": "true" } : {}),
        },
        nativeAttributes: {
            type: "checkbox",
            ...(options.name ? { name: options.name } : {}),
            ...(options.value ? { value: options.value } : {}),
            ...(disabled ? { disabled: "" } : {}),
            ...(required ? { required: "" } : {}),
        },
    };
}

export type CreateCheckboxControllerOptions = {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
};

export type CheckboxController = {
    readonly checked: ControllableState<boolean>;
    indeterminate: boolean;
    resolve(options?: Omit<ResolveCheckboxOptions, "checked">): CheckboxViewModel;
    toggle(): void;
    setChecked(checked: boolean): void;
};

export function createCheckboxController(
    options: CreateCheckboxControllerOptions = {},
): CheckboxController {
    const checked = createControllableState({
        defaultValue: options.defaultChecked ?? false,
        ...(options.checked === undefined ? {} : { value: options.checked }),
        ...(options.onCheckedChange === undefined ? {} : { onChange: options.onCheckedChange }),
    });
    let indeterminate = options.indeterminate === true;

    return {
        checked,
        get indeterminate() {
            return indeterminate;
        },
        set indeterminate(value: boolean) {
            indeterminate = value;
        },
        resolve(styleOptions = {}) {
            return resolveCheckbox({
                ...styleOptions,
                checked: checked.get(),
                indeterminate,
            });
        },
        toggle() {
            indeterminate = false;
            checked.set(!checked.get());
        },
        setChecked(value) {
            indeterminate = false;
            checked.set(value);
        },
    };
}

export type BindCheckboxOptions = ResolveCheckboxOptions & {
    onCheckedChange?: (checked: boolean) => void;
};

export function bindCheckbox(
    element: HTMLInputElement,
    getOptions: () => BindCheckboxOptions,
): Disposable {
    const apply = (): void => {
        const options = getOptions();
        const view = resolveCheckbox({
            ...options,
            checked: options.checked ?? element.checked,
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
        element.checked = view.checked;
        element.indeterminate = view.indeterminate;
        element.disabled = view.disabled;
    };

    const onChange = (): void => {
        const options = getOptions();
        options.onCheckedChange?.(element.checked);
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
