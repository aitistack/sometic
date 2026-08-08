export type HeadMeta = {
    name?: string;
    property?: string;
    content?: string;
    charset?: string;
    httpEquiv?: string;
};

export type HeadLink = {
    rel: string;
    href: string;
    as?: string;
    type?: string;
    crossOrigin?: string;
    media?: string;
    hreflang?: string;
};

export type HeadJsonLd = {
    type?: string;
    data: Record<string, unknown> | Record<string, unknown>[];
};

export type HeadAttrs = Record<string, string | undefined>;

export type HeadPatch = {
    title?: string;
    titleTemplate?: string;
    meta?: HeadMeta[];
    link?: HeadLink[];
    htmlAttrs?: HeadAttrs;
    bodyAttrs?: HeadAttrs;
    jsonLd?: HeadJsonLd[];
};

export type HeadSnapshot = {
    title: string;
    meta: HeadMeta[];
    link: HeadLink[];
    htmlAttrs: Record<string, string>;
    bodyAttrs: Record<string, string>;
    jsonLd: HeadJsonLd[];
};
