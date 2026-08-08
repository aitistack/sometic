import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { createSlotAttributes } from "@sometic/styling/slots";
import { resolveStateAttributes } from "@sometic/styling/state";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ResolveButtonGroupOptions = StyleableProps<"root"> & {
    orientation?: ButtonGroupOrientation;
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type ButtonGroupViewModel = {
    orientation: ButtonGroupOrientation;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveButtonGroup(options: ResolveButtonGroupOptions = {}): ButtonGroupViewModel {
    const orientation = options.orientation ?? "horizontal";
    const disabled = options.disabled === true;
    const rootClass = options.classes?.root;
    const rootStyle = options.styles?.root;
    const resolved = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        state: { className: { "is-disabled": disabled } },
        ...(rootClass !== undefined || rootStyle !== undefined
            ? {
                  user: {
                      ...(rootClass === undefined ? {} : { className: rootClass }),
                      ...(rootStyle === undefined ? {} : { style: rootStyle }),
                  },
              }
            : {}),
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });

    return {
        orientation,
        disabled,
        className: resolved.className,
        style: resolved.style,
        attributes: {
            ...createSlotAttributes("root"),
            role: "group",
            ...resolveStateAttributes({
                disabled,
                orientation,
            }),
        },
    };
}
