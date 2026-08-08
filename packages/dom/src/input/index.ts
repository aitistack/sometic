import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { createSlotAttributes, defineSlots, pickSlotValue } from "@sometic/styling/slots";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import type { FieldIds } from "../field/index.js";

export const INPUT_SLOTS = defineSlots([
    "root",
    "field",
    "label",
    "control",
    "nativeInput",
    "prefix",
    "suffix",
    "clear",
    "loader",
] as const);

export type InputSlot = (typeof INPUT_SLOTS)[number];

export type NativeInputType =
    | "text"
    | "search"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "date"
    | "datetime-local"
    | "time"
    | "month"
    | "week"
    | "file"
    | "hidden";

export type ResolveInputOptions = StyleableProps<InputSlot> & {
    type?: NativeInputType;
    value?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    invalid?: boolean;
    name?: string;
    placeholder?: string;
    autocomplete?: string;
    inputMode?: string;
    min?: string;
    max?: string;
    step?: string;
    multiple?: boolean;
    accept?: string;
    fieldIds?: FieldIds;
    describedBy?: string;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type InputSlotView = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type InputViewModel = {
    type: NativeInputType;
    value: string;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    invalid: boolean;
    filled: boolean;
    empty: boolean;
    name?: string;
    placeholder?: string;
    autocomplete?: string;
    inputMode?: string;
    min?: string;
    max?: string;
    step?: string;
    multiple: boolean;
    accept?: string;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    nativeAttributes: Record<string, string>;
    slots: Record<InputSlot, InputSlotView>;
};

function resolveSlotView(
    slot: InputSlot,
    options: ResolveInputOptions,
    stateClassName: ClassValue | undefined,
): InputSlotView {
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

export function resolveInput(options: ResolveInputOptions = {}): InputViewModel {
    const type = options.type ?? "text";
    const value = options.value ?? "";
    const disabled = options.disabled === true;
    const readonly = options.readonly === true;
    const required = options.required === true;
    const invalid = options.invalid === true;
    const filled = value.length > 0;
    const empty = !filled;
    const multiple = options.multiple === true;

    const stateClassName = {
        "is-disabled": disabled,
        "is-readonly": readonly,
        "is-invalid": invalid,
        "is-filled": filled,
        "is-empty": empty,
    };

    const root = resolveSlotView("root", options, stateClassName);
    const stateAttrs = resolveStateAttributes({
        disabled,
        readonly,
        invalid,
        filled,
        empty,
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });

    const nativeAttributes: Record<string, string> = {
        type,
        ...resolveSlotView("nativeInput", options, undefined).attributes,
    };
    if (type !== "file") {
        nativeAttributes.value = value;
    }
    if (disabled) {
        nativeAttributes.disabled = "";
    }
    if (readonly) {
        nativeAttributes.readonly = "";
    }
    if (required) {
        nativeAttributes.required = "";
        nativeAttributes["aria-required"] = "true";
    }
    if (invalid) {
        nativeAttributes["aria-invalid"] = "true";
    }
    if (options.name !== undefined) {
        nativeAttributes.name = options.name;
    }
    if (options.placeholder !== undefined) {
        nativeAttributes.placeholder = options.placeholder;
    }
    if (options.autocomplete !== undefined) {
        nativeAttributes.autocomplete = options.autocomplete;
    }
    if (options.inputMode !== undefined) {
        nativeAttributes.inputmode = options.inputMode;
    }
    if (options.min !== undefined) {
        nativeAttributes.min = options.min;
    }
    if (options.max !== undefined) {
        nativeAttributes.max = options.max;
    }
    if (options.step !== undefined) {
        nativeAttributes.step = options.step;
    }
    if (multiple) {
        nativeAttributes.multiple = "";
    }
    if (options.accept !== undefined) {
        nativeAttributes.accept = options.accept;
    }
    if (options.fieldIds !== undefined) {
        nativeAttributes.id = options.fieldIds.id;
        nativeAttributes["aria-labelledby"] = options.fieldIds.labelId;
    }
    if (options.describedBy !== undefined && options.describedBy.length > 0) {
        nativeAttributes["aria-describedby"] = options.describedBy;
    }

    return {
        type,
        value,
        disabled,
        readonly,
        required,
        invalid,
        filled,
        empty,
        ...(options.name === undefined ? {} : { name: options.name }),
        ...(options.placeholder === undefined ? {} : { placeholder: options.placeholder }),
        ...(options.autocomplete === undefined ? {} : { autocomplete: options.autocomplete }),
        ...(options.inputMode === undefined ? {} : { inputMode: options.inputMode }),
        ...(options.min === undefined ? {} : { min: options.min }),
        ...(options.max === undefined ? {} : { max: options.max }),
        ...(options.step === undefined ? {} : { step: options.step }),
        multiple,
        ...(options.accept === undefined ? {} : { accept: options.accept }),
        className: root.className,
        style: root.style,
        attributes: {
            ...root.attributes,
            ...stateAttrs,
        },
        nativeAttributes,
        slots: {
            root,
            field: resolveSlotView("field", options, undefined),
            label: resolveSlotView("label", options, undefined),
            control: resolveSlotView("control", options, undefined),
            nativeInput: resolveSlotView("nativeInput", options, undefined),
            prefix: resolveSlotView("prefix", options, undefined),
            suffix: resolveSlotView("suffix", options, undefined),
            clear: resolveSlotView("clear", options, undefined),
            loader: resolveSlotView("loader", options, undefined),
        },
    };
}

export function resolveSearchInput(
    options: Omit<ResolveInputOptions, "type"> = {},
): InputViewModel {
    return resolveInput({ ...options, type: "search" });
}

export function resolveEmailInput(options: Omit<ResolveInputOptions, "type"> = {}): InputViewModel {
    return resolveInput({ ...options, type: "email" });
}

export type CreateInputControllerOptions = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

export type InputController = {
    readonly value: ControllableState<string>;
    resolve(options?: Omit<ResolveInputOptions, "value">): InputViewModel;
};

export function createInputController(options: CreateInputControllerOptions = {}): InputController {
    const value = createControllableState({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        resolve(styleOptions = {}) {
            return resolveInput({
                ...styleOptions,
                value: value.get(),
            });
        },
    };
}

export type BindInputOptions = ResolveInputOptions & {
    onValueChange?: (value: string) => void;
};

export function bindInput(
    element: HTMLInputElement,
    getOptions: () => BindInputOptions,
): Disposable {
    let disposed = false;

    const apply = (): void => {
        const options = getOptions();
        const view = resolveInput(options);
        element.className = view.className;
        for (const [key, val] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (element.value !== val) {
                    element.value = val;
                }
                continue;
            }
            if (val === "") {
                element.setAttribute(key, "");
            } else {
                element.setAttribute(key, val);
            }
        }
        for (const key of ["disabled", "readonly", "required", "multiple"] as const) {
            if (!(key in view.nativeAttributes)) {
                element.removeAttribute(key);
            }
        }
    };

    const onInput = (): void => {
        const options = getOptions();
        if (options.disabled === true || options.readonly === true) {
            apply();
            return;
        }
        options.onValueChange?.(element.value);
        apply();
    };

    element.addEventListener("input", onInput);
    apply();

    return {
        get disposed() {
            return disposed;
        },
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            element.removeEventListener("input", onInput);
        },
    };
}
