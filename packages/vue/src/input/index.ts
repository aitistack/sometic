import { defineComponent, h, type PropType } from "vue";
import { resolveInput, type NativeInputType, type ResolveInputOptions } from "@sometic/dom/input";
import { resolvePasswordInput } from "@sometic/dom/input-password";
import { resolveOtpInput } from "@sometic/dom/input-otp";
import { resolveNumberInput } from "@sometic/dom/input-number";
import { resolveFileInput } from "@sometic/dom/input-file";
import { formatMasked } from "@sometic/dom/input-masked";
import { createCurrencyInputController } from "@sometic/dom/input-currency";
import { resolveDateInput } from "@sometic/dom/input-date";
import type { DateAdapter } from "@sometic/date-core";

export const Input = defineComponent({
    name: "SometicInput",
    props: {
        modelValue: { type: String, default: "" },
        type: { type: String as PropType<NativeInputType>, default: "text" },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
        required: { type: Boolean, default: false },
        invalid: { type: Boolean, default: false },
        unstyled: { type: Boolean, default: false },
        classes: { type: Object as PropType<ResolveInputOptions["classes"]>, required: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveInput({
                type: props.type,
                value: props.modelValue,
                disabled: props.disabled,
                readonly: props.readonly,
                required: props.required,
                invalid: props.invalid,
                unstyled: props.unstyled,
                ...(props.classes === undefined ? {} : { classes: props.classes }),
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.type === "file" ? undefined : view.value,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    emit("update:modelValue", (event.target as HTMLInputElement).value);
                },
            });
        };
    },
});

export const PasswordInput = defineComponent({
    name: "SometicPasswordInput",
    props: {
        modelValue: { type: String, default: "" },
        revealed: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
        invalid: { type: Boolean, default: false },
    },
    emits: ["update:modelValue", "update:revealed"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolvePasswordInput({
                value: props.modelValue,
                revealed: props.revealed,
                disabled: props.disabled,
                readonly: props.readonly,
                invalid: props.invalid,
            });
            return h(
                "div",
                {
                    class: "sometic-password",
                    "data-revealed": props.revealed ? "true" : undefined,
                    style: { position: "relative", display: "grid" },
                },
                [
                    h("input", {
                        ...attrs,
                        class: view.className,
                        style: { ...view.style, paddingRight: "4.25rem" },
                        ...view.nativeAttributes,
                        value: view.value,
                        onInput: (event: Event) => {
                            if (props.disabled || props.readonly) {
                                return;
                            }
                            emit("update:modelValue", (event.target as HTMLInputElement).value);
                        },
                    }),
                    h(
                        "button",
                        {
                            type: "button",
                            "data-reveal": true,
                            "aria-pressed": props.revealed ? "true" : "false",
                            "aria-label": props.revealed ? "Hide password" : "Show password",
                            disabled: props.disabled,
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
                            onClick: (event: Event) => {
                                event.preventDefault();
                                emit("update:revealed", !props.revealed);
                            },
                        },
                        props.revealed ? "Hide" : "Show",
                    ),
                ],
            );
        };
    },
});

export const OtpInput = defineComponent({
    name: "SometicOtpInput",
    props: {
        modelValue: { type: String, default: "" },
        length: { type: Number, default: 6 },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveOtpInput({
                value: props.modelValue,
                length: props.length,
                disabled: props.disabled,
                readonly: props.readonly,
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.value,
                maxlength: props.length,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    const next = (event.target as HTMLInputElement).value
                        .replace(/\D/g, "")
                        .slice(0, props.length);
                    emit("update:modelValue", next);
                },
            });
        };
    },
});

export const NumberInput = defineComponent({
    name: "SometicNumberInput",
    props: {
        modelValue: { type: Number as PropType<number | null>, default: null },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveNumberInput({
                value: props.modelValue,
                disabled: props.disabled,
                readonly: props.readonly,
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.value,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    const raw = (event.target as HTMLInputElement).value;
                    emit("update:modelValue", raw.trim() === "" ? null : Number(raw));
                },
            });
        };
    },
});

export const FileInput = defineComponent({
    name: "SometicFileInput",
    props: {
        disabled: { type: Boolean, default: false },
        multiple: { type: Boolean, default: false },
        accept: { type: String, required: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveFileInput({
                disabled: props.disabled,
                multiple: props.multiple,
                ...(props.accept === undefined ? {} : { accept: props.accept }),
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                onChange: (event: Event) => {
                    if (props.disabled) {
                        return;
                    }
                    const files = (event.target as HTMLInputElement).files;
                    emit("update:modelValue", files ? [...files] : []);
                },
            });
        };
    },
});

export const MaskedInput = defineComponent({
    name: "SometicMaskedInput",
    props: {
        modelValue: { type: String, default: "" },
        mask: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const formatted = formatMasked(props.modelValue, props.mask);
            const view = resolveInput({
                type: "text",
                value: formatted.display,
                disabled: props.disabled,
                readonly: props.readonly,
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.value,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    const stripped = [...(event.target as HTMLInputElement).value]
                        .filter((char) => /[a-zA-Z0-9]/.test(char))
                        .join("");
                    emit("update:modelValue", formatMasked(stripped, props.mask).raw);
                },
            });
        };
    },
});

export const CurrencyInput = defineComponent({
    name: "SometicCurrencyInput",
    props: {
        modelValue: { type: Number as PropType<number | null>, default: null },
        locale: { type: String, default: "en-US" },
        currency: { type: String, default: "USD" },
        fractionDigits: { type: Number, default: 2 },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const controller = createCurrencyInputController({
                locale: props.locale,
                currency: props.currency,
                fractionDigits: props.fractionDigits,
                value: props.modelValue,
            });
            const view = controller.resolve({
                disabled: props.disabled,
                readonly: props.readonly,
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.value,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    controller.setFromDisplay((event.target as HTMLInputElement).value);
                    emit("update:modelValue", controller.value.get());
                },
            });
        };
    },
});

export const DateInput = defineComponent({
    name: "SometicDateInput",
    props: {
        modelValue: { type: Object as PropType<Date | null>, default: null },
        adapter: { type: Object as PropType<DateAdapter>, required: true },
        disabled: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveDateInput({
                adapter: props.adapter,
                value: props.modelValue,
                disabled: props.disabled,
                readonly: props.readonly,
            });
            return h("input", {
                ...attrs,
                class: view.className,
                style: view.style,
                ...view.nativeAttributes,
                value: view.value,
                onInput: (event: Event) => {
                    if (props.disabled || props.readonly) {
                        return;
                    }
                    const raw = (event.target as HTMLInputElement).value;
                    if (raw.trim() === "") {
                        emit("update:modelValue", null);
                        return;
                    }
                    const parsed = props.adapter.deserialize(raw);
                    emit("update:modelValue", parsed.valid ? parsed.date : null);
                },
            });
        };
    },
});
