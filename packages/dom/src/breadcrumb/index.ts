import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveBreadcrumbOptions = StyleableProps<"root"> & {
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type BreadcrumbViewModel = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveBreadcrumb(options: ResolveBreadcrumbOptions = {}): BreadcrumbViewModel {
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
        className: styled.className,
        style: styled.style,
        attributes: {
            "aria-label": "Breadcrumb",
            "data-slot": "root",
        },
    };
}

export type ResolveBreadcrumbItemOptions = StyleableProps<"root"> & {
    current?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type BreadcrumbItemViewModel = {
    current: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveBreadcrumbItem(
    options: ResolveBreadcrumbItemOptions = {},
): BreadcrumbItemViewModel {
    const current = options.current === true;
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
        current,
        className: styled.className,
        style: styled.style,
        attributes: {
            "data-slot": "item",
            ...(current ? { "aria-current": "page", "data-current": "" } : {}),
        },
    };
}
