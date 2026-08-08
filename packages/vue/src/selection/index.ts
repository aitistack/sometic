import { defineComponent, h, type PropType } from "vue";
import { resolveCheckbox } from "@sometic/dom/checkbox";
import { resolveRadio } from "@sometic/dom/radio";
import { resolveSelect, type SelectOption } from "@sometic/dom/select";
import { resolveSwitch } from "@sometic/dom/switch";

export const Checkbox = defineComponent({
    name: "SometicCheckbox",
    props: {
        checked: { type: Boolean, default: undefined },
        defaultChecked: { type: Boolean, default: false },
        indeterminate: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        name: { type: String, required: false },
        value: { type: String, required: false },
    },
    emits: ["update:checked", "checkedChange"],
    setup(props, { emit, attrs }) {
        let uncontrolled = props.defaultChecked;
        return () => {
            const checked = props.checked ?? uncontrolled;
            const view = resolveCheckbox({
                checked,
                indeterminate: props.indeterminate,
                disabled: props.disabled,
                ...(props.name === undefined ? {} : { name: props.name }),
                ...(props.value === undefined ? {} : { value: props.value }),
            });
            return h("input", {
                ...attrs,
                type: "checkbox",
                class: view.className || undefined,
                style: view.style,
                ...view.attributes,
                ...view.nativeAttributes,
                checked: view.checked,
                disabled: view.disabled,
                onChange: (event: Event) => {
                    const target = event.target as HTMLInputElement;
                    uncontrolled = target.checked;
                    emit("update:checked", target.checked);
                    emit("checkedChange", target.checked);
                },
            });
        };
    },
});

export const Switch = defineComponent({
    name: "SometicSwitch",
    props: {
        checked: { type: Boolean, default: undefined },
        defaultChecked: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        name: { type: String, required: false },
        value: { type: String, required: false },
    },
    emits: ["update:checked", "checkedChange"],
    setup(props, { emit, attrs }) {
        let uncontrolled = props.defaultChecked;
        return () => {
            const checked = props.checked ?? uncontrolled;
            const view = resolveSwitch({
                checked,
                disabled: props.disabled,
                ...(props.name === undefined ? {} : { name: props.name }),
                ...(props.value === undefined ? {} : { value: props.value }),
            });
            return h("input", {
                ...attrs,
                type: "checkbox",
                class: view.className || undefined,
                style: view.style,
                ...view.attributes,
                ...view.nativeAttributes,
                checked: view.checked,
                disabled: view.disabled,
                onChange: (event: Event) => {
                    const target = event.target as HTMLInputElement;
                    uncontrolled = target.checked;
                    emit("update:checked", target.checked);
                    emit("checkedChange", target.checked);
                },
            });
        };
    },
});

export const Radio = defineComponent({
    name: "SometicRadio",
    props: {
        value: { type: String, required: true },
        checked: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        name: { type: String, required: false },
    },
    emits: ["valueChange"],
    setup(props, { emit, attrs }) {
        return () => {
            const view = resolveRadio({
                value: props.value,
                checked: props.checked,
                disabled: props.disabled,
                ...(props.name === undefined ? {} : { name: props.name }),
            });
            return h("input", {
                ...attrs,
                type: "radio",
                class: view.className || undefined,
                style: view.style,
                ...view.attributes,
                ...view.nativeAttributes,
                checked: view.checked,
                disabled: view.disabled,
                onChange: () => {
                    emit("valueChange", props.value);
                },
            });
        };
    },
});

export const Select = defineComponent({
    name: "SometicSelect",
    props: {
        modelValue: { type: String as PropType<string | null>, default: undefined },
        defaultValue: { type: String as PropType<string | null>, default: null },
        options: { type: Array as PropType<SelectOption[]>, required: true },
        disabled: { type: Boolean, default: false },
        name: { type: String, required: false },
    },
    emits: ["update:modelValue", "valueChange"],
    setup(props, { emit, attrs, slots }) {
        let uncontrolled = props.defaultValue;
        return () => {
            const value = props.modelValue !== undefined ? props.modelValue : uncontrolled;
            const view = resolveSelect({
                value,
                options: props.options,
                disabled: props.disabled,
                ...(props.name === undefined ? {} : { name: props.name }),
            });
            return h(
                "select",
                {
                    ...attrs,
                    class: view.className || undefined,
                    style: view.style,
                    ...view.attributes,
                    ...view.nativeAttributes,
                    disabled: view.disabled,
                    value: value ?? "",
                    onChange: (event: Event) => {
                        const target = event.target as HTMLSelectElement;
                        const next = target.value === "" ? null : target.value;
                        uncontrolled = next;
                        emit("update:modelValue", next);
                        emit("valueChange", next);
                    },
                },
                slots.default
                    ? slots.default()
                    : props.options.map((option) =>
                          h(
                              "option",
                              {
                                  value: option.value,
                                  disabled: option.disabled === true,
                              },
                              option.label,
                          ),
                      ),
            );
        };
    },
});
