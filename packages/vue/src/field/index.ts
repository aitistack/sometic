import { defineComponent, h, type PropType } from "vue";
import {
    createFieldIds,
    resolveField,
    type FieldIds,
    type ResolveFieldOptions,
} from "@sometic/dom/field";

export const Field = defineComponent({
    name: "SometicField",
    props: {
        ids: { type: Object as PropType<FieldIds>, required: false },
        disabled: { type: Boolean, default: false },
        invalid: { type: Boolean, default: false },
        readonly: { type: Boolean, default: false },
        required: { type: Boolean, default: false },
        label: { type: String, required: false },
        description: { type: String, required: false },
        error: { type: String, required: false },
        unstyled: { type: Boolean, default: false },
        classes: { type: Object as PropType<ResolveFieldOptions["classes"]>, required: false },
    },
    setup(props, { slots, attrs }) {
        return () => {
            const ids = props.ids ?? createFieldIds();
            const view = resolveField({
                ids,
                disabled: props.disabled,
                invalid: props.invalid,
                readonly: props.readonly,
                required: props.required,
                hasDescription: props.description != null || slots.description != null,
                hasError: props.error != null || slots.error != null,
                unstyled: props.unstyled,
                ...(props.classes === undefined ? {} : { classes: props.classes }),
            });
            return h(
                "div",
                { ...attrs, class: view.className, style: view.style, ...view.attributes },
                [
                    props.label != null || slots.label
                        ? h(
                              "label",
                              {
                                  ...view.labelAttributes,
                                  class: view.slots.label.className,
                                  style: view.slots.label.style,
                              },
                              slots.label?.() ?? props.label,
                          )
                        : null,
                    props.description != null || slots.description
                        ? h(
                              "div",
                              {
                                  ...view.descriptionAttributes,
                                  class: view.slots.description.className,
                                  style: view.slots.description.style,
                              },
                              slots.description?.() ?? props.description,
                          )
                        : null,
                    h(
                        "div",
                        {
                            class: view.slots.control.className,
                            style: view.slots.control.style,
                            ...view.slots.control.attributes,
                        },
                        slots.default?.(),
                    ),
                    props.error != null || slots.error
                        ? h(
                              "div",
                              {
                                  ...view.errorAttributes,
                                  class: view.slots.error.className,
                                  style: view.slots.error.style,
                              },
                              slots.error?.() ?? props.error,
                          )
                        : null,
                ],
            );
        };
    },
});
