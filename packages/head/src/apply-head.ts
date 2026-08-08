import type { HeadSnapshot } from "./types.js";

const MANAGED = "data-sometic-head";

function clearManaged(parent: ParentNode, selector: string): void {
    for (const node of [...parent.querySelectorAll(selector)]) {
        if (node.getAttribute(MANAGED) === "true") {
            node.remove();
        }
    }
}

export function applyHead(doc: Document, snapshot: HeadSnapshot): void {
    if (snapshot.title) {
        doc.title = snapshot.title;
    }

    const head = doc.head;
    if (!head) {
        return;
    }

    clearManaged(head, `meta[${MANAGED}="true"]`);
    clearManaged(head, `link[${MANAGED}="true"]`);
    clearManaged(head, `script[${MANAGED}="true"]`);

    for (const meta of snapshot.meta) {
        const el = doc.createElement("meta");
        el.setAttribute(MANAGED, "true");
        if (meta.charset) {
            el.setAttribute("charset", meta.charset);
        }
        if (meta.httpEquiv) {
            el.setAttribute("http-equiv", meta.httpEquiv);
        }
        if (meta.name) {
            el.setAttribute("name", meta.name);
        }
        if (meta.property) {
            el.setAttribute("property", meta.property);
        }
        if (meta.content !== undefined) {
            el.setAttribute("content", meta.content);
        }
        head.appendChild(el);
    }

    for (const link of snapshot.link) {
        const el = doc.createElement("link");
        el.setAttribute(MANAGED, "true");
        el.setAttribute("rel", link.rel);
        el.setAttribute("href", link.href);
        if (link.as) {
            el.setAttribute("as", link.as);
        }
        if (link.type) {
            el.setAttribute("type", link.type);
        }
        if (link.crossOrigin) {
            el.setAttribute("crossorigin", link.crossOrigin);
        }
        if (link.media) {
            el.setAttribute("media", link.media);
        }
        if (link.hreflang) {
            el.setAttribute("hreflang", link.hreflang);
        }
        head.appendChild(el);
    }

    for (const entry of snapshot.jsonLd) {
        const el = doc.createElement("script");
        el.setAttribute(MANAGED, "true");
        el.setAttribute("type", entry.type ?? "application/ld+json");
        el.textContent = JSON.stringify(entry.data);
        head.appendChild(el);
    }

    const root = doc.documentElement;
    for (const [key, value] of Object.entries(snapshot.htmlAttrs)) {
        root.setAttribute(key, value);
    }
    if (doc.body) {
        for (const [key, value] of Object.entries(snapshot.bodyAttrs)) {
            doc.body.setAttribute(key, value);
        }
    }
}
