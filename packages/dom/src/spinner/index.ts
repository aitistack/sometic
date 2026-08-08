import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveSpinnerOptions = StyleableProps<"root"> & {
    label?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type SpinnerViewModel = {
    label: string;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveSpinner(options: ResolveSpinnerOptions = {}): SpinnerViewModel {
    const label = options.label ?? "Loading";
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
        label,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "status",
            "data-slot": "root",
            "aria-live": "polite",
            "aria-label": label,
        },
    };
}
