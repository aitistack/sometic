import { describe, expect, it } from "vitest";
import { createHeadController } from "../create-head-controller.js";
import {
    createCanonicalLink,
    createHreflangLinks,
    createJsonLdPatch,
    createOpenGraphPatch,
    createPageSeoPatch,
    createRouteHeadStack,
    createTwitterPatch,
    detectHeadConflicts,
} from "./index.js";

describe("seo patches", () => {
    it("builds page, open graph, and twitter patches", () => {
        expect(createPageSeoPatch({ title: "Home", description: "Welcome" })).toEqual({
            title: "Home",
            meta: [{ name: "description", content: "Welcome" }],
        });
        expect(createOpenGraphPatch({ title: "Home", type: "website" }).meta).toEqual([
            { property: "og:title", content: "Home" },
            { property: "og:type", content: "website" },
        ]);
        expect(createTwitterPatch({ card: "summary", title: "Home" }).meta).toEqual([
            { name: "twitter:card", content: "summary" },
            { name: "twitter:title", content: "Home" },
        ]);
    });

    it("builds canonical, hreflang, and json-ld patches", () => {
        expect(createCanonicalLink("https://sometic.dev/")).toEqual({
            rel: "canonical",
            href: "https://sometic.dev/",
        });
        expect(
            createHreflangLinks([
                { hreflang: "en", href: "https://sometic.dev/en" },
                { hreflang: "fr", href: "https://sometic.dev/fr" },
            ]),
        ).toEqual([
            { rel: "alternate", href: "https://sometic.dev/en", hreflang: "en" },
            { rel: "alternate", href: "https://sometic.dev/fr", hreflang: "fr" },
        ]);
        const jsonLd = createJsonLdPatch({
            type: "SoftwareApplication",
            data: { name: "Sometic" },
        });
        expect(jsonLd.jsonLd?.[0]?.type).toBe("SoftwareApplication");
        expect(jsonLd.jsonLd?.[0]?.data).toMatchObject({
            "@type": "SoftwareApplication",
            name: "Sometic",
        });
    });
});

describe("createRouteHeadStack", () => {
    it("sets and removes route-scoped patches", () => {
        const head = createHeadController({ initial: { title: "Root" } });
        const stack = createRouteHeadStack(head);
        stack.enter("docs", { title: "Docs" });
        expect(head.get().title).toBe("Docs");
        stack.leave("docs");
        expect(head.get().title).toBe("Root");
        head.dispose();
    });
});

describe("detectHeadConflicts", () => {
    it("warns on duplicate meta name/property and og:title without canonical", () => {
        const warnings = detectHeadConflicts({
            title: "Page",
            meta: [
                { name: "description", content: "a" },
                { name: "description", content: "b" },
                { property: "og:title", content: "Page" },
                { property: "og:title", content: "Again" },
            ],
            link: [],
            htmlAttrs: {},
            bodyAttrs: {},
            jsonLd: [],
        });
        expect(warnings.map((item) => item.code)).toEqual([
            "duplicate-meta-name",
            "duplicate-meta-property",
            "og-title-without-canonical",
        ]);
    });

    it("is quiet when og:title has a canonical link", () => {
        const warnings = detectHeadConflicts({
            title: "Page",
            meta: [{ property: "og:title", content: "Page" }],
            link: [{ rel: "canonical", href: "https://sometic.dev/" }],
            htmlAttrs: {},
            bodyAttrs: {},
            jsonLd: [],
        });
        expect(warnings).toEqual([]);
    });
});
