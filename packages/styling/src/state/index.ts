export const STATE_ATTRIBUTE_KEYS = {
    disabled: "data-disabled",
    loading: "data-loading",
    invalid: "data-invalid",
    readonly: "data-readonly",
    focused: "data-focused",
    focusVisible: "data-focus-visible",
    filled: "data-filled",
    empty: "data-empty",
    checked: "data-checked",
    selected: "data-selected",
    expanded: "data-expanded",
    orientation: "data-orientation",
    size: "data-size",
    variant: "data-variant",
} as const;

export type StyleState = {
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    readonly?: boolean;
    focused?: boolean;
    focusVisible?: boolean;
    filled?: boolean;
    empty?: boolean;
    checked?: boolean | "indeterminate";
    selected?: boolean;
    expanded?: boolean;
    orientation?: string;
    size?: string;
    variant?: string;
};

export type ResolveStateAttributesOptions = {
    booleanValue?: "true" | "";
};

type BooleanStateKey =
    | "disabled"
    | "loading"
    | "invalid"
    | "readonly"
    | "focused"
    | "focusVisible"
    | "filled"
    | "empty"
    | "selected"
    | "expanded";

const BOOLEAN_KEYS: readonly BooleanStateKey[] = [
    "disabled",
    "loading",
    "invalid",
    "readonly",
    "focused",
    "focusVisible",
    "filled",
    "empty",
    "selected",
    "expanded",
];

const STRING_KEYS = ["orientation", "size", "variant"] as const;

export function resolveStateAttributes(
    state: StyleState,
    options: ResolveStateAttributesOptions = {},
): Record<string, string> {
    const booleanValue = options.booleanValue ?? "true";
    const attrs: Record<string, string> = {};

    for (const key of BOOLEAN_KEYS) {
        if (state[key] === true) {
            attrs[STATE_ATTRIBUTE_KEYS[key]] = booleanValue;
        }
    }

    const checked = state.checked;
    if (checked === true) {
        attrs[STATE_ATTRIBUTE_KEYS.checked] = booleanValue;
    } else if (checked === "indeterminate") {
        attrs[STATE_ATTRIBUTE_KEYS.checked] = "indeterminate";
    }

    for (const key of STRING_KEYS) {
        const value = state[key];
        if (value != null && value.length > 0) {
            attrs[STATE_ATTRIBUTE_KEYS[key]] = value;
        }
    }

    return attrs;
}
