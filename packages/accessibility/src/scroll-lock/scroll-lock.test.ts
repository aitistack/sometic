import { describe, expect, it } from "vitest";
import { lockBodyScroll } from "./index.js";

describe("scroll-lock", () => {
    it("locks with refcount and restores styles", () => {
        document.body.style.overflow = "auto";
        const first = lockBodyScroll();
        expect(document.body.style.overflow).toBe("hidden");
        const second = lockBodyScroll();
        second.dispose();
        expect(document.body.style.overflow).toBe("hidden");
        first.dispose();
        expect(document.body.style.overflow).toBe("auto");
    });
});
