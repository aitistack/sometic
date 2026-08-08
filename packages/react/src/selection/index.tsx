import {
    createElement,
    forwardRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type HTMLAttributes,
    type InputHTMLAttributes,
    type ReactElement,
    type ReactNode,
    type SelectHTMLAttributes,
} from "react";
import { resolveCheckbox, type ResolveCheckboxOptions } from "@sometic/dom/checkbox";
import { createComboboxController, resolveCombobox } from "@sometic/dom/combobox";
import { resolveRadio, type ResolveRadioOptions } from "@sometic/dom/radio";
import { resolveSelect, type ResolveSelectOptions, type SelectOption } from "@sometic/dom/select";
import { resolveSwitch, type ResolveSwitchOptions } from "@sometic/dom/switch";

export type CheckboxProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "defaultChecked" | "onChange"
> &
    ResolveCheckboxOptions & {
        defaultChecked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    function Checkbox(props, ref): ReactElement {
        const {
            checked,
            defaultChecked = false,
            indeterminate = false,
            disabled,
            required,
            invalid,
            name,
            value,
            className,
            onCheckedChange,
            ...rest
        } = props;
        const [uncontrolled, setUncontrolled] = useState(defaultChecked);
        const isControlled = checked !== undefined;
        const current = isControlled ? checked === true : uncontrolled;

        const view = useMemo(
            () =>
                resolveCheckbox({
                    checked: current,
                    indeterminate,
                    ...(disabled === undefined ? {} : { disabled }),
                    ...(required === undefined ? {} : { required }),
                    ...(invalid === undefined ? {} : { invalid }),
                    ...(name === undefined ? {} : { name }),
                    ...(value === undefined ? {} : { value: String(value) }),
                    ...(className ? { classes: { root: className } } : {}),
                }),
            [current, indeterminate, disabled, required, invalid, name, value, className],
        );

        const onChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                if (!isControlled) {
                    setUncontrolled(event.target.checked);
                }
                onCheckedChange?.(event.target.checked);
            },
            [isControlled, onCheckedChange],
        );

        return createElement("input", {
            ...rest,
            ref,
            type: "checkbox",
            className: view.className || undefined,
            style: view.style,
            ...view.attributes,
            ...view.nativeAttributes,
            checked: view.checked,
            disabled: view.disabled,
            onChange,
        });
    },
);

export type SwitchProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "defaultChecked" | "onChange" | "role"
> &
    ResolveSwitchOptions & {
        defaultChecked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    function Switch(props, ref): ReactElement {
        const {
            checked,
            defaultChecked = false,
            disabled,
            required,
            invalid,
            name,
            value,
            className,
            onCheckedChange,
            ...rest
        } = props;
        const [uncontrolled, setUncontrolled] = useState(defaultChecked);
        const isControlled = checked !== undefined;
        const current = isControlled ? checked === true : uncontrolled;
        const view = useMemo(
            () =>
                resolveSwitch({
                    checked: current,
                    ...(disabled === undefined ? {} : { disabled }),
                    ...(required === undefined ? {} : { required }),
                    ...(invalid === undefined ? {} : { invalid }),
                    ...(name === undefined ? {} : { name }),
                    ...(value === undefined ? {} : { value: String(value) }),
                    ...(className ? { classes: { root: className } } : {}),
                }),
            [current, disabled, required, invalid, name, value, className],
        );
        const onChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                if (!isControlled) {
                    setUncontrolled(event.target.checked);
                }
                onCheckedChange?.(event.target.checked);
            },
            [isControlled, onCheckedChange],
        );
        return createElement("input", {
            ...rest,
            ref,
            type: "checkbox",
            className: view.className || undefined,
            style: view.style,
            ...view.attributes,
            ...view.nativeAttributes,
            checked: view.checked,
            disabled: view.disabled,
            onChange,
        });
    },
);

export type RadioProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "onChange" | "value"
> &
    Omit<ResolveRadioOptions, "checked" | "value"> & {
        value: string;
        checked?: boolean;
        onValueChange?: (value: string) => void;
    };

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    function Radio(props, ref): ReactElement {
        const {
            value,
            checked = false,
            disabled,
            required,
            invalid,
            name,
            className,
            onValueChange,
            ...rest
        } = props;
        const view = useMemo(
            () =>
                resolveRadio({
                    value,
                    checked,
                    ...(disabled === undefined ? {} : { disabled }),
                    ...(required === undefined ? {} : { required }),
                    ...(invalid === undefined ? {} : { invalid }),
                    ...(name === undefined ? {} : { name }),
                    ...(className ? { classes: { root: className } } : {}),
                }),
            [value, checked, disabled, required, invalid, name, className],
        );
        return createElement("input", {
            ...rest,
            ref,
            type: "radio",
            className: view.className || undefined,
            style: view.style,
            ...view.attributes,
            ...view.nativeAttributes,
            checked: view.checked,
            disabled: view.disabled,
            onChange: () => {
                onValueChange?.(value);
            },
        });
    },
);

export type SelectProps = Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "defaultValue" | "onChange"
> &
    ResolveSelectOptions & {
        defaultValue?: string | null;
        options: readonly SelectOption[];
        onValueChange?: (value: string | null) => void;
    };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    function Select(props, ref): ReactElement {
        const {
            value,
            defaultValue = null,
            options,
            disabled,
            required,
            invalid,
            name,
            multiple,
            className,
            onValueChange,
            children,
            ...rest
        } = props;
        const [uncontrolled, setUncontrolled] = useState(defaultValue);
        const isControlled = value !== undefined;
        const current = isControlled ? (value ?? null) : uncontrolled;
        const view = useMemo(
            () =>
                resolveSelect({
                    value: current,
                    options,
                    ...(disabled === undefined ? {} : { disabled }),
                    ...(required === undefined ? {} : { required }),
                    ...(invalid === undefined ? {} : { invalid }),
                    ...(multiple === undefined ? {} : { multiple }),
                    ...(name === undefined ? {} : { name }),
                    ...(className ? { classes: { root: className } } : {}),
                }),
            [current, options, disabled, required, invalid, multiple, name, className],
        );
        return createElement(
            "select",
            {
                ...rest,
                ref,
                className: view.className || undefined,
                style: view.style,
                ...view.attributes,
                ...view.nativeAttributes,
                disabled: view.disabled,
                required: view.required,
                multiple: view.multiple,
                value: current ?? "",
                onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                    const next = event.target.value === "" ? null : event.target.value;
                    if (!isControlled) {
                        setUncontrolled(next);
                    }
                    onValueChange?.(next);
                },
            },
            children ??
                options.map((option) =>
                    createElement(
                        "option",
                        {
                            key: option.value,
                            value: option.value,
                            disabled: option.disabled === true,
                        },
                        option.label,
                    ),
                ),
        );
    },
);

export type ComboboxProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    disabled?: boolean;
    children?: ReactNode;
};

export function Combobox(props: ComboboxProps): ReactElement {
    const {
        open,
        defaultOpen = false,
        onOpenChange,
        value,
        defaultValue = null,
        onValueChange,
        disabled,
        children,
        ...rest
    } = props;
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
    const openControlled = open !== undefined;
    const valueControlled = value !== undefined;
    const currentOpen = openControlled ? open === true : uncontrolledOpen;
    const currentValue = valueControlled ? value : uncontrolledValue;
    const openControlledRef = useRef(openControlled);
    openControlledRef.current = openControlled;
    const valueControlledRef = useRef(valueControlled);
    valueControlledRef.current = valueControlled;

    const controllerRef = useRef<ReturnType<typeof createComboboxController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createComboboxController({
            defaultOpen: currentOpen,
            defaultValue: currentValue,
            onOpenChange: (next) => {
                if (!openControlledRef.current) {
                    setUncontrolledOpen(next);
                }
                onOpenChangeRef.current?.(next);
            },
            onValueChange: (next) => {
                if (!valueControlledRef.current) {
                    setUncontrolledValue(next);
                }
                onValueChangeRef.current?.(next);
            },
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setOpen(currentOpen);
        controllerRef.current?.setValue(currentValue);
    }, [currentOpen, currentValue]);

    useEffect(() => {
        return () => {
            controllerRef.current = null;
        };
    }, []);

    const view = useMemo(
        () =>
            resolveCombobox({
                open: currentOpen,
                ...(disabled === undefined ? {} : { disabled }),
            }),
        [currentOpen, disabled],
    );
    return createElement(
        "div",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
            onClick: (event) => {
                props.onClick?.(event as never);
                if (disabled) {
                    return;
                }
                controllerRef.current?.setOpen(!currentOpen);
            },
            "data-value": currentValue ?? undefined,
        },
        children,
    );
}
