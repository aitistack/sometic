import { describe, expect, it } from "vitest";
import { createAccordionController } from "./index.js";

describe("accordion", () => {
    it("toggles single item", () => {
        const accordion = createAccordionController({ defaultValue: "" });
        accordion.toggle("a");
        expect(accordion.isOpen("a")).toBe(true);
        accordion.toggle("a");
        expect(accordion.isOpen("a")).toBe(false);
    });
});
