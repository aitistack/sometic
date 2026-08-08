import { describe, expect, it } from "vitest";
import { applyHead } from "./apply-head.js";
import { createHeadController } from "./create-head-controller.js";
import { serializeHead } from "./serialize.js";

describe("createHeadController", () => {
    it("merges nested patches with later wins for title", () => {
        const head = createHeadController({
            initial: { title: "Sometic", titleTemplate: "%s | Docs" },
        });
        head.set("page", { title: "Architecture" });
        expect(head.get().title).toBe("Architecture | Docs");
        head.remove("page");
        expect(head.get().title).toBe("Sometic | Docs");
        head.dispose();
    });

    it("dedupes meta by name", () => {
        const head = createHeadController();
        head.set("a", { meta: [{ name: "description", content: "one" }] });
        head.set("b", { meta: [{ name: "description", content: "two" }] });
        expect(head.get().meta).toEqual([{ name: "description", content: "two" }]);
        head.dispose();
    });

    it("notifies subscribers", () => {
        const head = createHeadController();
        const titles: string[] = [];
        const stop = head.subscribe((snap) => titles.push(snap.title));
        head.set("x", { title: "A" });
        head.set("x", { title: "B" });
        stop();
        head.set("x", { title: "C" });
        expect(titles).toEqual(["A", "B"]);
        head.dispose();
    });
});

describe("serializeHead", () => {
    it("emits title and meta", () => {
        const html = serializeHead({
            title: "Hello",
            meta: [{ name: "description", content: "World" }],
            link: [],
            htmlAttrs: {},
            bodyAttrs: {},
            jsonLd: [],
        });
        expect(html).toContain("<title>Hello</title>");
        expect(html).toContain('name="description"');
        expect(html).toContain('content="World"');
    });

    it("escapes JSON-LD so script tags cannot break out", () => {
        const html = serializeHead({
            title: "",
            meta: [],
            link: [],
            htmlAttrs: {},
            bodyAttrs: {},
            jsonLd: [{ data: { name: "</script><script>alert(1)</script>" } }],
        });
        expect(html).not.toContain("</script><script>");
        expect(html).toContain("\\u003c/script\\u003e");
    });
});

describe("applyHead", () => {
    it("writes document title and managed meta", () => {
        applyHead(document, {
            title: "Applied",
            meta: [{ name: "og:title", content: "Applied" }],
            link: [],
            htmlAttrs: { lang: "en" },
            bodyAttrs: {},
            jsonLd: [],
        });
        expect(document.title).toBe("Applied");
        expect(document.documentElement.getAttribute("lang")).toBe("en");
        expect(document.head.querySelector('meta[name="og:title"]')?.getAttribute("content")).toBe(
            "Applied",
        );
    });
});
