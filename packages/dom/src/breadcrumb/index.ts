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

export type ResolveBreadcrumbEllipsisOptions = StyleableProps<"root"> & {
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type BreadcrumbEllipsisViewModel = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveBreadcrumbEllipsis(
    options: ResolveBreadcrumbEllipsisOptions = {},
): BreadcrumbEllipsisViewModel {
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
            "data-slot": "ellipsis",
            "aria-hidden": "true",
        },
    };
}

export type BreadcrumbOverflowItem<T> = T & { id: string };

export type CollapseBreadcrumbItemsResult<T> = {
    items: Array<BreadcrumbOverflowItem<T> | { id: string; ellipsis: true }>;
    collapsed: BreadcrumbOverflowItem<T>[];
};

export function collapseBreadcrumbItems<T extends { id: string }>(
    items: readonly T[],
    maxItems?: number,
): CollapseBreadcrumbItemsResult<T> {
    if (maxItems === undefined || maxItems < 1 || items.length <= maxItems) {
        return {
            items: items.map((item) => ({ ...item })),
            collapsed: [],
        };
    }
    if (maxItems === 1) {
        const last = items[items.length - 1];
        if (!last) {
            return { items: [], collapsed: [] };
        }
        return {
            items: [{ ...last }],
            collapsed: items.slice(0, -1).map((item) => ({ ...item })),
        };
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
        return { items: [], collapsed: [] };
    }
    const keepTail = Math.max(1, maxItems - 2);
    const collapsed = items.slice(1, items.length - keepTail).map((item) => ({ ...item }));
    const tail = items.slice(items.length - keepTail).map((item) => ({ ...item }));
    return {
        items: [{ ...first }, { id: "__breadcrumb_ellipsis__", ellipsis: true as const }, ...tail],
        collapsed,
    };
}
