import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ResolveBadgeOptions = StyleableProps<"root"> & {
    tone?: BadgeTone;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type BadgeViewModel = {
    tone: BadgeTone;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveBadge(options: ResolveBadgeOptions = {}): BadgeViewModel {
    const tone = options.tone ?? "neutral";
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
        tone,
        className: styled.className,
        style: styled.style,
        attributes: {
            "data-slot": "root",
            "data-tone": tone,
        },
    };
}
