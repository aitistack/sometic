import {
    createElement,
    forwardRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type InputHTMLAttributes,
    type ReactElement,
} from "react";
import { resolveInput, type ResolveInputOptions } from "@sometic/dom/input";
import { resolvePasswordInput } from "@sometic/dom/input-password";
import { resolveOtpInput } from "@sometic/dom/input-otp";
import { resolveNumberInput } from "@sometic/dom/input-number";
import { resolveFileInput } from "@sometic/dom/input-file";
import { formatMasked } from "@sometic/dom/input-masked";
import { createCurrencyInputController } from "@sometic/dom/input-currency";
import { resolveDateInput } from "@sometic/dom/input-date";
import type { DateAdapter } from "@sometic/date-core";

function toReactStyle(style: Record<string, string>): CSSProperties {
    return style as CSSProperties;
}

function omitNativeConflicts<T extends Record<string, unknown>>(
    props: T,
): Omit<T, keyof ResolveInputOptions | "value" | "defaultValue" | "onValueChange"> {
    const {
        type: _t,
        value: _v,
        defaultValue: _d,
        onValueChange: _o,
        disabled: _dis,
        readonly: _ro,
        required: _req,
        invalid: _inv,
        name: _n,
        placeholder: _p,
        autocomplete: _a,
        inputMode: _im,
        min: _min,
        max: _max,
        step: _step,
        multiple: _mul,
        accept: _acc,
        fieldIds: _f,
        describedBy: _db,
        size: _s,
        variant: _var,
        unstyled: _u,
        classes: _c,
        styles: _st,
        cssVariables: _cv,
        defaults: _def,
        variants: _vars,
        merge: _m,
        ...rest
    } = props as T &
        ResolveInputOptions & {
            defaultValue?: unknown;
            onValueChange?: unknown;
        };
    void _t;
    void _v;
    void _d;
    void _o;
    void _dis;
    void _ro;
    void _req;
    void _inv;
    void _n;
    void _p;
    void _a;
    void _im;
    void _min;
    void _max;
    void _step;
    void _mul;
    void _acc;
    void _f;
    void _db;
    void _s;
    void _var;
    void _u;
    void _c;
    void _st;
    void _cv;
    void _def;
    void _vars;
    void _m;
    return rest;
}

export type InputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size"
> &
    ResolveInputOptions & {
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
    };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
    const controlled = Object.prototype.hasOwnProperty.call(props, "value");
    const [uncontrolled, setUncontrolled] = useState(props.defaultValue ?? "");
    const value = controlled ? (props.value ?? "") : uncontrolled;
    const view = resolveInput({
        ...props,
        value,
    });
    const rest = omitNativeConflicts(props as Record<string, unknown>);

    return createElement("input", {
        ...rest,
        ref,
        className: view.className,
        style: { ...toReactStyle(view.style), ...props.style },
        ...view.nativeAttributes,
        value: view.type === "file" ? undefined : view.value,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            if (props.disabled || props.readonly) {
                return;
            }
            const next = event.target.value;
            if (!controlled) {
                setUncontrolled(next);
            }
            props.onValueChange?.(next);
        },
    }) as ReactElement;
});

export type PasswordInputProps = Omit<InputProps, "type"> & {
    revealed?: boolean;
    defaultRevealed?: boolean;
    onRevealedChange?: (revealed: boolean) => void;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput(props, ref) {
        const controlled = Object.prototype.hasOwnProperty.call(props, "value");
        const [uncontrolled, setUncontrolled] = useState(props.defaultValue ?? "");
        const value = controlled ? (props.value ?? "") : uncontrolled;
        const revealedControlled = Object.prototype.hasOwnProperty.call(props, "revealed");
        const [revealedState, setRevealedState] = useState(props.defaultRevealed ?? false);
        const revealed = revealedControlled ? (props.revealed ?? false) : revealedState;
        const view = resolvePasswordInput({ ...props, value, revealed });
        const rest = omitNativeConflicts(props as Record<string, unknown>);

        const toggle = (): void => {
            const next = !revealed;
            if (!revealedControlled) {
                setRevealedState(next);
            }
            props.onRevealedChange?.(next);
        };

        return createElement(
            "div",
            {
                className: "sometic-password",
                "data-revealed": revealed ? "true" : undefined,
                style: { position: "relative", display: "grid" },
            },
            createElement("input", {
                ...rest,
                ref,
                className: view.className,
                style: {
                    ...toReactStyle(view.style),
                    ...props.style,
                    paddingRight: "4.25rem",
                },
                ...view.nativeAttributes,
                value: view.value,
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    const next = event.target.value;
                    if (!controlled) {
                        setUncontrolled(next);
                    }
                    props.onValueChange?.(next);
                },
            }),
            createElement(
                "button",
                {
                    type: "button",
                    "data-reveal": true,
                    "aria-pressed": revealed,
                    "aria-label": revealed ? "Hide password" : "Show password",
                    disabled: props.disabled,
                    onClick: toggle,
                    style: {
                        position: "absolute",
                        top: "50%",
                        right: "0.4rem",
                        transform: "translateY(-50%)",
                        border: "1px solid transparent",
                        borderRadius: "3px",
                        background: "transparent",
                        cursor: props.disabled ? "not-allowed" : "pointer",
                        font: "inherit",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "0.35rem 0.5rem",
                    },
                },
                revealed ? "Hide" : "Show",
            ),
        ) as ReactElement;
    },
);

export type OtpInputProps = Omit<InputProps, "type" | "value" | "defaultValue"> & {
    length?: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(props, ref) {
    const length = props.length ?? 6;
    const controlled = Object.prototype.hasOwnProperty.call(props, "value");
    const [uncontrolled, setUncontrolled] = useState(props.defaultValue ?? "");
    const value = controlled ? (props.value ?? "") : uncontrolled;
    const view = resolveOtpInput({ ...props, length, value });
    const rest = omitNativeConflicts(props as Record<string, unknown>);

    return createElement("input", {
        ...rest,
        ref,
        className: view.className,
        style: { ...toReactStyle(view.style), ...props.style },
        ...view.nativeAttributes,
        value: view.value,
        maxLength: length,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            if (props.disabled || props.readonly) {
                return;
            }
            const next = event.target.value.replace(/\D/g, "").slice(0, length);
            if (!controlled) {
                setUncontrolled(next);
            }
            props.onValueChange?.(next);
        },
    }) as ReactElement;
});

export type NumberInputProps = Omit<
    InputProps,
    "type" | "value" | "defaultValue" | "onValueChange"
> & {
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    minNumber?: number;
    maxNumber?: number;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    function NumberInput(props, ref) {
        const controlled = Object.prototype.hasOwnProperty.call(props, "value");
        const [uncontrolled, setUncontrolled] = useState<number | null>(props.defaultValue ?? null);
        const value = controlled ? (props.value ?? null) : uncontrolled;
        const view = resolveNumberInput({ ...props, value });
        const rest = omitNativeConflicts(props as Record<string, unknown>);

        return createElement("input", {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...props.style },
            ...view.nativeAttributes,
            value: view.value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (props.disabled || props.readonly) {
                    return;
                }
                const raw = event.target.value;
                const next = raw.trim() === "" ? null : Number(raw);
                if (next !== null && Number.isNaN(next)) {
                    return;
                }
                let clamped = next;
                if (
                    clamped !== null &&
                    props.minNumber !== undefined &&
                    clamped < props.minNumber
                ) {
                    clamped = props.minNumber;
                }
                if (
                    clamped !== null &&
                    props.maxNumber !== undefined &&
                    clamped > props.maxNumber
                ) {
                    clamped = props.maxNumber;
                }
                if (!controlled) {
                    setUncontrolled(clamped);
                }
                props.onValueChange?.(clamped);
            },
        }) as ReactElement;
    },
);

export type FileInputProps = Omit<
    InputProps,
    "type" | "value" | "defaultValue" | "onValueChange"
> & {
    value?: File[];
    defaultValue?: File[];
    onValueChange?: (files: File[]) => void;
};

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    function FileInput(props, ref) {
        const view = resolveFileInput(props);
        const rest = omitNativeConflicts(props as Record<string, unknown>);
        void props.value;
        void props.defaultValue;

        return createElement("input", {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...props.style },
            ...view.nativeAttributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (props.disabled || props.readonly) {
                    return;
                }
                props.onValueChange?.(event.target.files ? [...event.target.files] : []);
            },
        }) as ReactElement;
    },
);

export type MaskedInputProps = Omit<InputProps, "type" | "value" | "defaultValue"> & {
    mask: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (raw: string) => void;
};

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    function MaskedInput(props, ref) {
        const controlled = Object.prototype.hasOwnProperty.call(props, "value");
        const [uncontrolled, setUncontrolled] = useState(props.defaultValue ?? "");
        const raw = controlled ? (props.value ?? "") : uncontrolled;
        const formatted = formatMasked(raw, props.mask);
        const view = resolveInput({
            ...props,
            type: "text",
            value: formatted.display,
        });
        const rest = omitNativeConflicts(props as Record<string, unknown>);

        return createElement("input", {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...props.style },
            ...view.nativeAttributes,
            value: view.value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (props.disabled || props.readonly) {
                    return;
                }
                const stripped = [...event.target.value]
                    .filter((char) => /[a-zA-Z0-9]/.test(char))
                    .join("");
                const next = formatMasked(stripped, props.mask).raw;
                if (!controlled) {
                    setUncontrolled(next);
                }
                props.onValueChange?.(next);
            },
        }) as ReactElement;
    },
);

export type CurrencyInputProps = Omit<
    InputProps,
    "type" | "value" | "defaultValue" | "onValueChange"
> & {
    locale?: string;
    currency?: string;
    fractionDigits?: number;
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    function CurrencyInput(props, ref) {
        const controlled = Object.prototype.hasOwnProperty.call(props, "value");
        const [uncontrolled, setUncontrolled] = useState<number | null>(props.defaultValue ?? null);
        const value = controlled ? (props.value ?? null) : uncontrolled;
        const controller = createCurrencyInputController({
            ...(props.locale === undefined ? {} : { locale: props.locale }),
            ...(props.currency === undefined ? {} : { currency: props.currency }),
            ...(props.fractionDigits === undefined ? {} : { fractionDigits: props.fractionDigits }),
            value,
            ...(props.onValueChange === undefined ? {} : { onValueChange: props.onValueChange }),
        });
        const view = controller.resolve(props);
        const rest = omitNativeConflicts(props as Record<string, unknown>);

        return createElement("input", {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...props.style },
            ...view.nativeAttributes,
            value: view.value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (props.disabled || props.readonly) {
                    return;
                }
                controller.setFromDisplay(event.target.value);
                const next = controller.value.get();
                if (!controlled) {
                    setUncontrolled(next);
                }
                props.onValueChange?.(next);
            },
        }) as ReactElement;
    },
);

export type DateInputProps = Omit<
    InputProps,
    "type" | "value" | "defaultValue" | "onValueChange"
> & {
    adapter: DateAdapter;
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
};

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    function DateInput(props, ref) {
        const controlled = Object.prototype.hasOwnProperty.call(props, "value");
        const [uncontrolled, setUncontrolled] = useState<Date | null>(props.defaultValue ?? null);
        const value = controlled ? (props.value ?? null) : uncontrolled;
        const view = resolveDateInput({ ...props, adapter: props.adapter, value });
        const rest = omitNativeConflicts(props as Record<string, unknown>);

        return createElement("input", {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...props.style },
            ...view.nativeAttributes,
            value: view.value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (props.disabled || props.readonly) {
                    return;
                }
                const raw = event.target.value;
                const parsed =
                    raw.trim() === ""
                        ? { date: null, valid: true }
                        : props.adapter.deserialize(raw);
                const next = parsed.valid ? parsed.date : null;
                if (!controlled) {
                    setUncontrolled(next);
                }
                props.onValueChange?.(next);
            },
        }) as ReactElement;
    },
);
