import { createPrefixedId } from "@sometic/core/id";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { createSlotAttributes, defineSlots, pickSlotValue } from "@sometic/styling/slots";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export const FIELD_SLOTS = defineSlots([
    "root",
    "label",
    "description",
    "control",
    "error",
    "extra",
] as const);

export type FieldSlot = (typeof FIELD_SLOTS)[number];

export type FieldIds = {
    id: string;
    labelId: string;
    descriptionId: string;
    errorId: string;
};

export function createFieldIds(prefix = "field"): FieldIds {
    const id = createPrefixedId(prefix);
    return {
        id,
        labelId: `${id}-label`,
        descriptionId: `${id}-description`,
        errorId: `${id}-error`,
    };
}

export type ResolveFieldOptions = StyleableProps<FieldSlot> & {
    ids?: FieldIds;
    disabled?: boolean;
    invalid?: boolean;
    readonly?: boolean;
    required?: boolean;
    hasDescription?: boolean;
    hasError?: boolean;
    size?: string;
    variant?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type FieldSlotView = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type FieldViewModel = {
    ids: FieldIds;
    disabled: boolean;
    invalid: boolean;
    readonly: boolean;
    required: boolean;
    labelAttributes: Record<string, string>;
    controlAttributes: Record<string, string>;
    descriptionAttributes: Record<string, string>;
    errorAttributes: Record<string, string>;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    slots: Record<FieldSlot, FieldSlotView>;
};

function resolveSlotView(
    slot: FieldSlot,
    options: ResolveFieldOptions,
    stateClassName: ClassValue | undefined,
): FieldSlotView {
    const userClass = pickSlotValue(options.classes, slot);
    const userStyle = pickSlotValue(options.styles, slot);
    const isRoot = slot === "root";
    const resolved = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(isRoot && options.defaults !== undefined ? { defaults: options.defaults } : {}),
        ...(isRoot && options.variants !== undefined ? { variants: options.variants } : {}),
        ...(isRoot && stateClassName !== undefined ? { state: { className: stateClassName } } : {}),
        ...(userClass !== undefined || userStyle !== undefined
            ? {
                  user: {
                      ...(userClass === undefined ? {} : { className: userClass }),
                      ...(userStyle === undefined ? {} : { style: userStyle }),
                  },
              }
            : {}),
        ...(isRoot && options.cssVariables !== undefined
            ? { cssVariables: options.cssVariables }
            : {}),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });

    return {
        className: resolved.className,
        style: resolved.style,
        attributes: createSlotAttributes(slot),
    };
}

export function resolveField(options: ResolveFieldOptions = {}): FieldViewModel {
    const ids = options.ids ?? createFieldIds();
    const disabled = options.disabled === true;
    const invalid = options.invalid === true;
    const readonly = options.readonly === true;
    const required = options.required === true;
    const hasDescription = options.hasDescription === true;
    const hasError = options.hasError === true;

    const stateClassName = {
        "is-disabled": disabled,
        "is-invalid": invalid,
        "is-readonly": readonly,
        "is-required": required,
    };

    const root = resolveSlotView("root", options, stateClassName);
    const stateAttrs = resolveStateAttributes({
        disabled,
        invalid,
        readonly,
        ...(options.size === undefined ? {} : { size: options.size }),
        ...(options.variant === undefined ? {} : { variant: options.variant }),
    });

    const describedByParts: string[] = [];
    if (hasDescription) {
        describedByParts.push(ids.descriptionId);
    }
    if (hasError) {
        describedByParts.push(ids.errorId);
    }

    const controlAttributes: Record<string, string> = {
        id: ids.id,
        "aria-labelledby": ids.labelId,
    };
    if (describedByParts.length > 0) {
        controlAttributes["aria-describedby"] = describedByParts.join(" ");
    }
    if (invalid) {
        controlAttributes["aria-invalid"] = "true";
    }
    if (required) {
        controlAttributes["aria-required"] = "true";
    }
    if (disabled) {
        controlAttributes.disabled = "";
    }
    if (readonly) {
        controlAttributes.readonly = "";
    }

    return {
        ids,
        disabled,
        invalid,
        readonly,
        required,
        labelAttributes: {
            id: ids.labelId,
            for: ids.id,
        },
        controlAttributes,
        descriptionAttributes: {
            id: ids.descriptionId,
        },
        errorAttributes: {
            id: ids.errorId,
        },
        className: root.className,
        style: root.style,
        attributes: {
            ...root.attributes,
            ...stateAttrs,
        },
        slots: {
            root,
            label: resolveSlotView("label", options, undefined),
            description: resolveSlotView("description", options, undefined),
            control: resolveSlotView("control", options, undefined),
            error: resolveSlotView("error", options, undefined),
            extra: resolveSlotView("extra", options, undefined),
        },
    };
}
