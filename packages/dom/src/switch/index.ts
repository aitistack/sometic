import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveSwitchOptions = StyleableProps<"root"> & {
    checked?: boolean;
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

export type SwitchViewModel = {
    checked: boolean;
    disabled: boolean;
    required: boolean;
    invalid: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    nativeAttributes: Record<string, string>;
};

export function resolveSwitch(options: ResolveSwitchOptions = {}): SwitchViewModel {
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
        className: styled.className,
        style: styled.style,
        attributes: {
            ...state,
            role: "switch",
            "data-slot": "root",
            "aria-checked": checked ? "true" : "false",
            ...(invalid ? { "aria-invalid": "true" } : {}),
        },
        nativeAttributes: {
            type: "checkbox",
            role: "switch",
            ...(options.name ? { name: options.name } : {}),
            ...(options.value ? { value: options.value } : {}),
            ...(disabled ? { disabled: "" } : {}),
            ...(required ? { required: "" } : {}),
        },
    };
}

export type CreateSwitchControllerOptions = {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
};

export type SwitchController = {
    readonly checked: ControllableState<boolean>;
    resolve(options?: Omit<ResolveSwitchOptions, "checked">): SwitchViewModel;
    toggle(): void;
    setChecked(checked: boolean): void;
};

export function createSwitchController(
    options: CreateSwitchControllerOptions = {},
): SwitchController {
    const checked = createControllableState({
        defaultValue: options.defaultChecked ?? false,
        ...(options.checked === undefined ? {} : { value: options.checked }),
        ...(options.onCheckedChange === undefined ? {} : { onChange: options.onCheckedChange }),
    });

    return {
        checked,
        resolve(styleOptions = {}) {
            return resolveSwitch({
                ...styleOptions,
                checked: checked.get(),
            });
        },
        toggle() {
            checked.set(!checked.get());
        },
        setChecked(value) {
            checked.set(value);
        },
    };
}
