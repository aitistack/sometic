import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveProgressOptions = StyleableProps<"root"> & {
    value?: number;
    max?: number;
    indeterminate?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type ProgressViewModel = {
    value: number | undefined;
    max: number;
    indeterminate: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveProgress(options: ResolveProgressOptions = {}): ProgressViewModel {
    const max = options.max ?? 100;
    const indeterminate = options.indeterminate === true || options.value === undefined;
    const value = options.value;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        value,
        max,
        indeterminate,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "progressbar",
            "data-slot": "root",
            "aria-valuemin": "0",
            "aria-valuemax": String(max),
            ...(indeterminate || value === undefined
                ? { "data-state": "indeterminate" }
                : {
                      "aria-valuenow": String(value),
                      "data-state": "determinate",
                      "data-value": String(value),
                  }),
        },
    };
}
