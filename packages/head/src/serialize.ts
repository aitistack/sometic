import type { HeadSnapshot } from "./types.js";

function esc(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

export function serializeHead(snapshot: HeadSnapshot): string {
    const parts: string[] = [];
    if (snapshot.title) {
        parts.push(`<title>${esc(snapshot.title)}</title>`);
    }
    for (const meta of snapshot.meta) {
        const attrs: string[] = ['data-sometic-head="true"'];
        if (meta.charset) {
            attrs.push(`charset="${esc(meta.charset)}"`);
        }
        if (meta.httpEquiv) {
            attrs.push(`http-equiv="${esc(meta.httpEquiv)}"`);
        }
        if (meta.name) {
            attrs.push(`name="${esc(meta.name)}"`);
        }
        if (meta.property) {
            attrs.push(`property="${esc(meta.property)}"`);
        }
        if (meta.content !== undefined) {
            attrs.push(`content="${esc(meta.content)}"`);
        }
        parts.push(`<meta ${attrs.join(" ")}>`);
    }
    for (const link of snapshot.link) {
        const attrs = [
            'data-sometic-head="true"',
            `rel="${esc(link.rel)}"`,
            `href="${esc(link.href)}"`,
        ];
        if (link.as) {
            attrs.push(`as="${esc(link.as)}"`);
        }
        if (link.type) {
            attrs.push(`type="${esc(link.type)}"`);
        }
        if (link.hreflang) {
            attrs.push(`hreflang="${esc(link.hreflang)}"`);
        }
        if (link.media) {
            attrs.push(`media="${esc(link.media)}"`);
        }
        if (link.crossOrigin) {
            attrs.push(`crossorigin="${esc(link.crossOrigin)}"`);
        }
        parts.push(`<link ${attrs.join(" ")}>`);
    }
    for (const entry of snapshot.jsonLd) {
        const type = esc(entry.type ?? "application/ld+json");
        const json = JSON.stringify(entry.data)
            .replaceAll("<", "\\u003c")
            .replaceAll(">", "\\u003e")
            .replaceAll("&", "\\u0026")
            .replaceAll("\u2028", "\\u2028")
            .replaceAll("\u2029", "\\u2029");
        parts.push(`<script data-sometic-head="true" type="${type}">${json}</script>`);
    }
    return parts.join("\n");
}
