import type { HeadController } from "../create-head-controller.js";
import type { HeadJsonLd, HeadLink, HeadMeta, HeadPatch, HeadSnapshot } from "../types.js";

export type PageSeoOptions = {
    title?: string;
    description?: string;
    titleTemplate?: string;
    robots?: string;
    keywords?: string | readonly string[];
};

export type OpenGraphOptions = {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    image?: string;
    siteName?: string;
    locale?: string;
};

export type TwitterCardOptions = {
    card?: "summary" | "summary_large_image" | "app" | "player" | (string & {});
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    creator?: string;
};

export type JsonLdType = "Article" | "Product" | "Organization" | "SoftwareApplication";

export type JsonLdOptions = {
    type: JsonLdType;
    data: Record<string, unknown>;
};

export type HeadConflictWarning = {
    code: "duplicate-meta-name" | "duplicate-meta-property" | "og-title-without-canonical";
    message: string;
    detail?: string;
};

export type RouteHeadStack = {
    enter(routeId: string, patch: HeadPatch): void;
    leave(routeId: string): void;
};

function meta(entries: Array<HeadMeta | undefined | false>): HeadMeta[] {
    return entries.filter((entry): entry is HeadMeta => Boolean(entry));
}

export function createPageSeoPatch(options: PageSeoOptions): HeadPatch {
    let keywords: string | undefined;
    if (typeof options.keywords === "string") {
        keywords = options.keywords;
    } else if (options.keywords !== undefined) {
        keywords = options.keywords.join(", ");
    }

    const patch: HeadPatch = {
        meta: meta([
            options.description !== undefined
                ? { name: "description", content: options.description }
                : false,
            options.robots !== undefined ? { name: "robots", content: options.robots } : false,
            keywords !== undefined ? { name: "keywords", content: keywords } : false,
        ]),
    };

    if (options.title !== undefined) {
        patch.title = options.title;
    }
    if (options.titleTemplate !== undefined) {
        patch.titleTemplate = options.titleTemplate;
    }

    return patch;
}

export function createOpenGraphPatch(options: OpenGraphOptions): HeadPatch {
    return {
        meta: meta([
            options.title !== undefined ? { property: "og:title", content: options.title } : false,
            options.description !== undefined
                ? { property: "og:description", content: options.description }
                : false,
            options.url !== undefined ? { property: "og:url", content: options.url } : false,
            options.type !== undefined ? { property: "og:type", content: options.type } : false,
            options.image !== undefined ? { property: "og:image", content: options.image } : false,
            options.siteName !== undefined
                ? { property: "og:site_name", content: options.siteName }
                : false,
            options.locale !== undefined
                ? { property: "og:locale", content: options.locale }
                : false,
        ]),
    };
}

export function createTwitterPatch(options: TwitterCardOptions): HeadPatch {
    return {
        meta: meta([
            options.card !== undefined ? { name: "twitter:card", content: options.card } : false,
            options.title !== undefined
                ? { name: "twitter:title", content: options.title }
                : false,
            options.description !== undefined
                ? { name: "twitter:description", content: options.description }
                : false,
            options.image !== undefined
                ? { name: "twitter:image", content: options.image }
                : false,
            options.site !== undefined ? { name: "twitter:site", content: options.site } : false,
            options.creator !== undefined
                ? { name: "twitter:creator", content: options.creator }
                : false,
        ]),
    };
}

export function createCanonicalLink(href: string): HeadLink {
    return { rel: "canonical", href };
}

export function createHreflangLinks(
    entries: ReadonlyArray<{ hreflang: string; href: string }>,
): HeadLink[] {
    return entries.map((entry) => ({
        rel: "alternate",
        href: entry.href,
        hreflang: entry.hreflang,
    }));
}

export function createJsonLdPatch(options: JsonLdOptions): HeadPatch {
    const payload: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": options.type,
        ...options.data,
    };
    const jsonLd: HeadJsonLd = {
        type: options.type,
        data: payload,
    };
    return { jsonLd: [jsonLd] };
}

export function createRouteHeadStack(controller: HeadController): RouteHeadStack {
    return {
        enter(routeId, patch) {
            controller.set(`route:${routeId}`, patch);
        },
        leave(routeId) {
            controller.remove(`route:${routeId}`);
        },
    };
}

export function detectHeadConflicts(snapshot: HeadSnapshot): HeadConflictWarning[] {
    const warnings: HeadConflictWarning[] = [];
    const names = new Map<string, number>();
    const properties = new Map<string, number>();

    for (const item of snapshot.meta) {
        if (item.name !== undefined) {
            names.set(item.name, (names.get(item.name) ?? 0) + 1);
        }
        if (item.property !== undefined) {
            properties.set(item.property, (properties.get(item.property) ?? 0) + 1);
        }
    }

    for (const [name, count] of names) {
        if (count > 1) {
            warnings.push({
                code: "duplicate-meta-name",
                message: `Duplicate meta name "${name}"`,
                detail: name,
            });
        }
    }

    for (const [property, count] of properties) {
        if (count > 1) {
            warnings.push({
                code: "duplicate-meta-property",
                message: `Duplicate meta property "${property}"`,
                detail: property,
            });
        }
    }

    const hasOgTitle = snapshot.meta.some(
        (item) => item.property === "og:title" || item.name === "og:title",
    );
    const hasCanonical = snapshot.link.some((item) => item.rel === "canonical");
    if (hasOgTitle && !hasCanonical) {
        warnings.push({
            code: "og-title-without-canonical",
            message: "Open Graph title is set without a canonical link",
        });
    }

    return warnings;
}
