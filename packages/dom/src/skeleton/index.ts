import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveSkeletonOptions = StyleableProps<"root"> & {
    animated?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type SkeletonViewModel = {
    animated: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveSkeleton(options: ResolveSkeletonOptions = {}): SkeletonViewModel {
    const animated = options.animated !== false;
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
        animated,
        className: styled.className,
        style: styled.style,
        attributes: {
            "data-slot": "root",
            "aria-hidden": "true",
            ...(animated ? { "data-animated": "" } : {}),
        },
    };
}
