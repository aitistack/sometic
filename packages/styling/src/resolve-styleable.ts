import { createClassResolver, type ClassMerger, type ClassValue } from "./classes/index.js";
import {
    resolveCssVariables,
    resolveStyles,
    type CssVariables,
    type StyleValue,
} from "./styles/index.js";

export const STYLE_OVERRIDE_PRIORITY = [
    "behavior",
    "defaults",
    "variants",
    "state",
    "user",
    "cssVariables",
] as const;

export type StyleOverrideLayer = (typeof STYLE_OVERRIDE_PRIORITY)[number];

export type StyleableLayer = {
    className?: ClassValue;
    style?: StyleValue;
};

export type StyleableProps<S extends string = string> = {
    unstyled?: boolean;
    classes?: Partial<Record<S, ClassValue>>;
    styles?: Partial<Record<S, StyleValue>>;
    cssVariables?: CssVariables;
};

export type ResolveStyleableOptions = {
    unstyled?: boolean;
    behavior?: StyleableLayer;
    defaults?: StyleableLayer;
    variants?: StyleableLayer;
    state?: StyleableLayer;
    user?: StyleableLayer;
    cssVariables?: CssVariables;
    merge?: ClassMerger;
};

export type ResolvedStyleable = {
    className: string;
    style: Record<string, string>;
};

function layerClass(layer: StyleableLayer | undefined): ClassValue | undefined {
    return layer?.className;
}

function layerStyle(layer: StyleableLayer | undefined): StyleValue | undefined {
    return layer?.style;
}

export function resolveStyleable(options: ResolveStyleableOptions): ResolvedStyleable {
    const unstyled = options.unstyled === true;
    const resolveClass = createClassResolver(
        options.merge === undefined ? {} : { merge: options.merge },
    );

    const className = resolveClass(
        layerClass(options.behavior),
        unstyled ? undefined : layerClass(options.defaults),
        unstyled ? undefined : layerClass(options.variants),
        layerClass(options.state),
        layerClass(options.user),
    );

    const style = resolveStyles(
        layerStyle(options.behavior),
        unstyled ? undefined : layerStyle(options.defaults),
        unstyled ? undefined : layerStyle(options.variants),
        layerStyle(options.state),
        layerStyle(options.user),
        resolveCssVariables(options.cssVariables),
    );

    return { className, style };
}
