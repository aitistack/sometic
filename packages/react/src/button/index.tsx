import {
    createElement,
    forwardRef,
    useCallback,
    useMemo,
    useState,
    useSyncExternalStore,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from "react";
import {
    createAsyncButtonController,
    handleButtonPress,
    resolveButton,
    resolveButtonGroup,
    resolveIconButton,
    resolveToggleButton,
    type ResolveButtonOptions,
    type ResolveButtonGroupOptions,
    type ResolveToggleButtonOptions,
} from "@sometic/dom";

type StyleableButtonProps = ResolveButtonOptions & {
    prefix?: ReactNode;
    suffix?: ReactNode;
    children?: ReactNode;
};

function mergeRootClasses(
    classes: ResolveButtonOptions["classes"],
    className: string | undefined,
): ResolveButtonOptions["classes"] | undefined {
    if (className === undefined) {
        return classes;
    }
    return {
        ...classes,
        root: classes?.root === undefined ? className : [classes.root, className],
    };
}

function withMergedClasses(
    options: ResolveButtonOptions,
    className: string | undefined,
): ResolveButtonOptions {
    const classes = mergeRootClasses(options.classes, className);
    if (classes === undefined) {
        const { classes: _omit, ...rest } = options;
        void _omit;
        return rest;
    }
    return { ...options, classes };
}

function toReactStyle(style: Record<string, string>): CSSProperties {
    return style as CSSProperties;
}

export type ButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "disabled" | "prefix"
> &
    StyleableButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
    const {
        prefix,
        suffix,
        children,
        onClick,
        className,
        style,
        type,
        disabled,
        loading,
        name,
        value,
        form,
        size,
        variant,
        unstyled,
        classes,
        styles,
        cssVariables,
        defaults,
        variants,
        merge,
        ...rest
    } = props;

    const view = resolveButton(
        withMergedClasses(
            {
                ...(type === undefined ? {} : { type }),
                ...(disabled === undefined ? {} : { disabled }),
                ...(loading === undefined ? {} : { loading }),
                ...(name === undefined ? {} : { name }),
                ...(value === undefined ? {} : { value }),
                ...(form === undefined ? {} : { form }),
                ...(size === undefined ? {} : { size }),
                ...(variant === undefined ? {} : { variant }),
                ...(unstyled === undefined ? {} : { unstyled }),
                ...(classes === undefined ? {} : { classes }),
                ...(styles === undefined ? {} : { styles }),
                ...(cssVariables === undefined ? {} : { cssVariables }),
                ...(defaults === undefined ? {} : { defaults }),
                ...(variants === undefined ? {} : { variants }),
                ...(merge === undefined ? {} : { merge }),
            },
            className,
        ),
    );

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
        handleButtonPress(view, event, () => {
            onClick?.(event);
        });
    };

    return createElement(
        "button",
        {
            ...rest,
            ref,
            type: view.type,
            disabled: view.nativeDisabled,
            name: view.name,
            value: view.value,
            form: view.form,
            className: view.className || undefined,
            style: { ...toReactStyle(view.style), ...style },
            ...view.attributes,
            onClick: handleClick,
        },
        prefix
            ? createElement(
                  "span",
                  {
                      ...view.slots.prefix.attributes,
                      className: view.slots.prefix.className || undefined,
                  },
                  prefix,
              )
            : null,
        createElement(
            "span",
            {
                ...view.slots.content.attributes,
                className: view.slots.content.className || undefined,
            },
            children,
        ),
        suffix
            ? createElement(
                  "span",
                  {
                      ...view.slots.suffix.attributes,
                      className: view.slots.suffix.className || undefined,
                  },
                  suffix,
              )
            : null,
        view.loading
            ? createElement("span", {
                  ...view.slots.loader.attributes,
                  className: view.slots.loader.className || undefined,
              })
            : null,
    );
});

export type IconButtonProps = Omit<ButtonProps, "aria-label"> & {
    "aria-label": string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    function IconButton(props, ref) {
        const { children, className, style, onClick, "aria-label": ariaLabel, ...rest } = props;
        const view = resolveIconButton({
            ...withMergedClasses(rest as ResolveButtonOptions, className),
            "aria-label": ariaLabel,
        });
        return createElement(
            "button",
            {
                ref,
                type: view.type,
                disabled: view.nativeDisabled,
                className: view.className || undefined,
                style: { ...toReactStyle(view.style), ...style },
                ...view.attributes,
                onClick: (event: MouseEvent<HTMLButtonElement>) => {
                    handleButtonPress(view, event, () => onClick?.(event));
                },
            },
            children,
        );
    },
);

export type ToggleButtonProps = Omit<ButtonProps, "aria-pressed"> &
    Pick<ResolveToggleButtonOptions, "pressed" | "defaultPressed" | "onPressedChange">;

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
    function ToggleButton(props, ref) {
        const {
            pressed: pressedProp,
            defaultPressed = false,
            onPressedChange,
            onClick,
            children,
            className,
            style,
            ...rest
        } = props;
        const [uncontrolled, setUncontrolled] = useState(defaultPressed);
        const isControlled = pressedProp !== undefined;
        const pressed = isControlled ? pressedProp : uncontrolled;

        const view = resolveToggleButton({
            ...withMergedClasses(rest as ResolveButtonOptions, className),
            pressed,
        });

        return createElement(
            "button",
            {
                ref,
                type: view.type,
                disabled: view.nativeDisabled,
                className: view.className || undefined,
                style: { ...toReactStyle(view.style), ...style },
                ...view.attributes,
                onClick: (event: MouseEvent<HTMLButtonElement>) => {
                    handleButtonPress(view, event, () => {
                        const next = !pressed;
                        if (!isControlled) {
                            setUncontrolled(next);
                        }
                        onPressedChange?.(next);
                        onClick?.(event);
                    });
                },
            },
            children,
        );
    },
);

export type AsyncButtonProps = Omit<ButtonProps, "loading"> & {
    action: (signal: AbortSignal) => Promise<unknown>;
};

export const AsyncButton = forwardRef<HTMLButtonElement, AsyncButtonProps>(
    function AsyncButton(props, ref) {
        const { action, onClick, children, className, style, ...rest } = props;
        const controller = useMemo(
            () =>
                createAsyncButtonController({
                    action,
                    ...(rest as ResolveButtonOptions),
                }),
            [action],
        );

        const subscribe = useCallback(
            (onStoreChange: () => void) => {
                const sub = controller.subscribe(onStoreChange);
                return () => {
                    sub.dispose();
                };
            },
            [controller],
        );

        useSyncExternalStore(
            subscribe,
            () => controller.operation.state.status,
            () => "idle",
        );

        const view = controller.resolve(withMergedClasses(rest as ResolveButtonOptions, className));

        return createElement(
            "button",
            {
                ref,
                type: view.type,
                disabled: view.nativeDisabled,
                className: view.className || undefined,
                style: { ...toReactStyle(view.style), ...style },
                ...view.attributes,
                onClick: (event: MouseEvent<HTMLButtonElement>) => {
                    void controller.press(event).then(() => {
                        onClick?.(event);
                    });
                },
            },
            children,
            view.loading ? createElement("span", { ...view.slots.loader.attributes }) : null,
        );
    },
);

export type ButtonGroupProps = ResolveButtonGroupOptions & {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
};

export function ButtonGroup(props: ButtonGroupProps): ReactElement {
    const { children, className, style, ...rest } = props;
    const classes = mergeRootClasses(rest.classes as ResolveButtonOptions["classes"], className);
    const view = resolveButtonGroup({
        ...rest,
        ...(classes === undefined ? {} : { classes: { root: classes.root } }),
    });
    return createElement(
        "div",
        {
            className: view.className || undefined,
            style: { ...toReactStyle(view.style), ...style },
            ...view.attributes,
        },
        children,
    );
}
