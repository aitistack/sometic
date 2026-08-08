import type {
    HeadAttrs,
    HeadJsonLd,
    HeadLink,
    HeadMeta,
    HeadPatch,
    HeadSnapshot,
} from "./types.js";

function metaKey(meta: HeadMeta): string {
    if (meta.charset) {
        return "charset";
    }
    if (meta.httpEquiv) {
        return `httpEquiv:${meta.httpEquiv}`;
    }
    if (meta.property) {
        return `property:${meta.property}`;
    }
    if (meta.name) {
        return `name:${meta.name}`;
    }
    return `anon:${JSON.stringify(meta)}`;
}

function linkKey(link: HeadLink): string {
    const lang = link.hreflang ?? "";
    return `${link.rel}|${lang}|${link.href}`;
}

function mergeAttrs(layers: Array<HeadAttrs | undefined>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const layer of layers) {
        if (!layer) {
            continue;
        }
        for (const [key, value] of Object.entries(layer)) {
            if (value === undefined) {
                delete out[key];
            } else {
                out[key] = value;
            }
        }
    }
    return out;
}

export function mergePatches(patches: HeadPatch[]): HeadSnapshot {
    let title = "";
    let titleTemplate: string | undefined;
    const metaMap = new Map<string, HeadMeta>();
    const linkMap = new Map<string, HeadLink>();
    const jsonLd: HeadJsonLd[] = [];
    const htmlLayers: Array<HeadAttrs | undefined> = [];
    const bodyLayers: Array<HeadAttrs | undefined> = [];

    for (const patch of patches) {
        if (patch.title !== undefined) {
            title = patch.title;
        }
        if (patch.titleTemplate !== undefined) {
            titleTemplate = patch.titleTemplate;
        }
        if (patch.meta) {
            for (const entry of patch.meta) {
                metaMap.set(metaKey(entry), entry);
            }
        }
        if (patch.link) {
            for (const entry of patch.link) {
                linkMap.set(linkKey(entry), entry);
            }
        }
        if (patch.jsonLd) {
            jsonLd.push(...patch.jsonLd);
        }
        htmlLayers.push(patch.htmlAttrs);
        bodyLayers.push(patch.bodyAttrs);
    }

    const resolvedTitle =
        titleTemplate && titleTemplate.includes("%s")
            ? titleTemplate.replace("%s", title)
            : titleTemplate
              ? `${title}${title ? " " : ""}${titleTemplate}`
              : title;

    return {
        title: resolvedTitle,
        meta: [...metaMap.values()],
        link: [...linkMap.values()],
        htmlAttrs: mergeAttrs(htmlLayers),
        bodyAttrs: mergeAttrs(bodyLayers),
        jsonLd,
    };
}
