import { defineComponent, h, onScopeDispose, shallowRef, type PropType } from "vue";
import {
    createAsyncButtonController,
    handleButtonPress,
    resolveButton,
    resolveButtonGroup,
    resolveIconButton,
    resolveToggleButton,
    type ButtonType,
    type ResolveButtonOptions,
} from "@sometic/dom";

export const Button = defineComponent({
    name: "SometicButton",
    props: {
        type: { type: String as PropType<ButtonType>, default: "button" },
        disabled: { type: Boolean, default: false },
        loading: { type: Boolean, default: false },
        unstyled: { type: Boolean, default: false },
        size: { type: String, required: false },
        variant: { type: String, required: false },
        classes: { type: Object as PropType<ResolveButtonOptions["classes"]>, required: false },
    },
    emits: ["click"],
    setup(props, { slots, emit, attrs }) {
        return () => {
            const view = resolveButton({
                type: props.type,
                disabled: props.disabled,
                loading: props.loading,
                unstyled: props.unstyled,
                ...(props.size === undefined ? {} : { size: props.size }),
                ...(props.variant === undefined ? {} : { variant: props.variant }),
                ...(props.classes === undefined ? {} : { classes: props.classes }),
            });
            return h(
                "button",
                {
                    ...attrs,
                    type: view.type,
                    disabled: view.nativeDisabled,
                    class: view.className || undefined,
                    style: view.style,
                    ...view.attributes,
                    onClick: (event: MouseEvent) => {
                        handleButtonPress(view, event, () => {
                            emit("click", event);
                        });
                    },
                },
                [
                    slots.prefix
                        ? h("span", { ...view.slots.prefix.attributes }, slots.prefix())
                        : null,
                    h("span", { ...view.slots.content.attributes }, slots.default?.()),
                    slots.suffix
                        ? h("span", { ...view.slots.suffix.attributes }, slots.suffix())
                        : null,
                    view.loading ? h("span", { ...view.slots.loader.attributes }) : null,
                ],
            );
        };
    },
});

export const IconButton = defineComponent({
    name: "SometicIconButton",
    props: {
        ariaLabel: { type: String, required: true },
        disabled: { type: Boolean, default: false },
    },
    emits: ["click"],
    setup(props, { slots, emit }) {
        return () => {
            const view = resolveIconButton({
                "aria-label": props.ariaLabel,
                disabled: props.disabled,
            });
            return h(
                "button",
                {
                    type: view.type,
                    disabled: view.nativeDisabled,
                    class: view.className || undefined,
                    ...view.attributes,
                    onClick: (event: MouseEvent) => {
                        handleButtonPress(view, event, () => emit("click", event));
                    },
                },
                slots.default?.(),
            );
        };
    },
});

export const ToggleButton = defineComponent({
    name: "SometicToggleButton",
    props: {
        pressed: { type: Boolean, required: false },
        defaultPressed: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
    },
    emits: ["update:pressed", "click"],
    data() {
        return {
            uncontrolled: this.defaultPressed as boolean,
        };
    },
    computed: {
        resolvedPressed(): boolean {
            return this.pressed === undefined ? this.uncontrolled : this.pressed;
        },
    },
    methods: {
        onClick(event: MouseEvent) {
            const view = resolveToggleButton({
                pressed: this.resolvedPressed,
                disabled: this.disabled,
            });
            handleButtonPress(view, event, () => {
                const next = !this.resolvedPressed;
                if (this.pressed === undefined) {
                    this.uncontrolled = next;
                }
                this.$emit("update:pressed", next);
                this.$emit("click", event);
            });
        },
    },
    render() {
        const view = resolveToggleButton({
            pressed: this.resolvedPressed,
            disabled: this.disabled,
        });
        return h(
            "button",
            {
                type: view.type,
                disabled: view.nativeDisabled,
                class: view.className || undefined,
                ...view.attributes,
                onClick: this.onClick,
            },
            this.$slots.default?.(),
        );
    },
});

export const ButtonGroup = defineComponent({
    name: "SometicButtonGroup",
    props: {
        orientation: {
            type: String as PropType<"horizontal" | "vertical">,
            default: "horizontal",
        },
        disabled: { type: Boolean, default: false },
    },
    setup(props, { slots }) {
        return () => {
            const view = resolveButtonGroup({
                orientation: props.orientation,
                disabled: props.disabled,
            });
            return h(
                "div",
                {
                    class: view.className || undefined,
                    style: view.style,
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});

export const AsyncButton = defineComponent({
    name: "SometicAsyncButton",
    props: {
        action: {
            type: Function as PropType<(signal: AbortSignal) => Promise<unknown>>,
            required: true,
        },
        type: { type: String as PropType<ButtonType>, default: "button" },
        disabled: { type: Boolean, default: false },
        unstyled: { type: Boolean, default: false },
    },
    emits: ["click"],
    setup(props, { slots, emit }) {
        const status = shallowRef("idle");
        const controller = createAsyncButtonController({
            action: props.action,
            type: props.type,
            disabled: props.disabled,
            unstyled: props.unstyled,
        });
        const unsubscribe = controller.subscribe(() => {
            status.value = controller.operation.state.status;
        });
        onScopeDispose(() => {
            unsubscribe.dispose();
        });
        return () => {
            void status.value;
            const view = controller.resolve({
                type: props.type,
                disabled: props.disabled,
                unstyled: props.unstyled,
            });
            return h(
                "button",
                {
                    type: view.type,
                    disabled: view.nativeDisabled,
                    class: view.className || undefined,
                    style: view.style,
                    ...view.attributes,
                    onClick: (event: MouseEvent) => {
                        void controller.press(event).then(() => {
                            emit("click", event);
                        });
                    },
                },
                [
                    h("span", { ...view.slots.content.attributes }, slots.default?.()),
                    view.loading ? h("span", { ...view.slots.loader.attributes }) : null,
                ],
            );
        };
    },
});
