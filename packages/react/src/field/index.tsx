import {
    createElement,
    forwardRef,
    type CSSProperties,
    type HTMLAttributes,
    type LabelHTMLAttributes,
    type ReactElement,
    type ReactNode,
} from "react";
import {
    createFieldIds,
    resolveField,
    type FieldIds,
    type ResolveFieldOptions,
} from "@sometic/dom/field";

function toReactStyle(style: Record<string, string>): CSSProperties {
    return style as CSSProperties;
}

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> &
    ResolveFieldOptions & {
        label?: ReactNode;
        description?: ReactNode;
        error?: ReactNode;
        children?: ReactNode;
        ids?: FieldIds;
    };

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
    const {
        label,
        description,
        error,
        children,
        ids: idsProp,
        disabled,
        invalid,
        readonly,
        required,
        size,
        variant,
        unstyled,
        classes,
        styles,
        cssVariables,
        defaults,
        variants,
        merge,
        className,
        style,
        ...rest
    } = props;

    const ids = idsProp ?? createFieldIds();
    const view = resolveField({
        ids,
        hasDescription: description != null,
        hasError: error != null,
        ...(disabled === undefined ? {} : { disabled }),
        ...(invalid === undefined ? {} : { invalid }),
        ...(readonly === undefined ? {} : { readonly }),
        ...(required === undefined ? {} : { required }),
        ...(size === undefined ? {} : { size }),
        ...(variant === undefined ? {} : { variant }),
        ...(unstyled === undefined ? {} : { unstyled }),
        ...(classes === undefined
            ? className === undefined
                ? {}
                : { classes: { root: className } }
            : {
                  classes: {
                      ...classes,
                      root:
                          className === undefined
                              ? classes.root
                              : classes.root === undefined
                                ? className
                                : [classes.root, className],
                  },
              }),
        ...(styles === undefined ? {} : { styles }),
        ...(cssVariables === undefined ? {} : { cssVariables }),
        ...(defaults === undefined ? {} : { defaults }),
        ...(variants === undefined ? {} : { variants }),
        ...(merge === undefined ? {} : { merge }),
    });

    return createElement(
        "div",
        {
            ...rest,
            ref,
            className: view.className,
            style: { ...toReactStyle(view.style), ...style },
            ...view.attributes,
        },
        label != null
            ? createElement(
                  "label",
                  {
                      ...view.labelAttributes,
                      className: view.slots.label.className,
                      style: toReactStyle(view.slots.label.style),
                  } satisfies LabelHTMLAttributes<HTMLLabelElement>,
                  label,
              )
            : null,
        description != null
            ? createElement(
                  "div",
                  {
                      ...view.descriptionAttributes,
                      className: view.slots.description.className,
                      style: toReactStyle(view.slots.description.style),
                  },
                  description,
              )
            : null,
        createElement(
            "div",
            {
                className: view.slots.control.className,
                style: toReactStyle(view.slots.control.style),
                ...view.slots.control.attributes,
            },
            children,
        ),
        error != null
            ? createElement(
                  "div",
                  {
                      ...view.errorAttributes,
                      className: view.slots.error.className,
                      style: toReactStyle(view.slots.error.style),
                  },
                  error,
              )
            : null,
    ) as ReactElement;
});
