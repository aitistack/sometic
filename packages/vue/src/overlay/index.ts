import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";
import { createDialogController, resolveDialog } from "@sometic/dom/dialog";
import { resolvePopover } from "@sometic/dom/popover";
import { resolveTooltip } from "@sometic/dom/tooltip";
import { resolveAlert, type AlertTone } from "@sometic/dom/alert";
import { createToastQueue, type ToastItem } from "@sometic/dom/toast";

export const Dialog = defineComponent({
    name: "SometicDialog",
    props: {
        open: { type: Boolean, default: undefined },
        defaultOpen: { type: Boolean, default: false },
        titleId: { type: String, default: undefined },
        descriptionId: { type: String, default: undefined },
    },
    emits: {
        "update:open": (_open: boolean) => true,
        openChange: (_open: boolean) => true,
    },
    setup(props, { slots, emit, attrs }) {
        const panelRef = ref<HTMLElement | null>(null);
        const uncontrolled = ref(props.defaultOpen);
        const isControlled = () => props.open !== undefined;
        const current = () => (isControlled() ? props.open === true : uncontrolled.value);

        const controller = createDialogController({
            defaultOpen: current(),
            getContent: () => panelRef.value,
            onOpenChange: (next) => {
                if (!isControlled()) {
                    uncontrolled.value = next;
                }
                emit("update:open", next);
                emit("openChange", next);
            },
        });

        onMounted(() => {
            controller.setOpen(current());
        });

        watch(
            () => props.open,
            () => {
                controller.setOpen(current());
            },
        );

        onBeforeUnmount(() => {
            controller.dispose();
        });

        return () => {
            if (!current()) {
                return null;
            }
            const view = resolveDialog({
                open: true,
                ...(props.titleId === undefined ? {} : { titleId: props.titleId }),
                ...(props.descriptionId === undefined
                    ? {}
                    : { descriptionId: props.descriptionId }),
            });
            return h(
                "div",
                {
                    ...attrs,
                    ref: panelRef,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});

export const Popover = defineComponent({
    name: "SometicPopover",
    props: {
        open: { type: Boolean, default: false },
    },
    setup(props, { slots }) {
        return () => {
            if (!props.open) {
                return null;
            }
            const view = resolvePopover({ open: true });
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

export const Tooltip = defineComponent({
    name: "SometicTooltip",
    props: {
        open: { type: Boolean, default: false },
        label: { type: String, required: true },
    },
    setup(props, { slots }) {
        return () => {
            const view = resolveTooltip({ open: props.open });
            return h("span", { style: { position: "relative", display: "inline-block" } }, [
                slots.default?.(),
                props.open
                    ? h(
                          "div",
                          {
                              class: view.className || undefined,
                              style: view.style,
                              ...view.attributes,
                          },
                          props.label,
                      )
                    : null,
            ]);
        };
    },
});

export const Alert = defineComponent({
    name: "SometicAlert",
    props: {
        tone: { type: String as PropType<AlertTone>, default: "info" },
    },
    setup(props, { slots }) {
        return () => {
            const view = resolveAlert({ tone: props.tone });
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

export const ToastRegion = defineComponent({
    name: "SometicToastRegion",
    setup(_, { slots }) {
        const items = ref<readonly ToastItem[]>([]);
        const queue = createToastQueue({
            onChange: (next) => {
                items.value = next;
            },
        });
        onBeforeUnmount(() => {
            queue.dispose();
        });
        return () =>
            h(
                "div",
                { "data-slot": "toast-region" },
                slots.default?.({
                    items: items.value,
                    push: (input: { title: string; description?: string }) => queue.push(input),
                    dismiss: (id: string) => queue.dismiss(id),
                }),
            );
    },
});
