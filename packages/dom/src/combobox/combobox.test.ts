import { describe, expect, it } from "vitest";
import { createComboboxController, resolveCombobox } from "./index.js";

describe("combobox", () => {
    it("exposes combobox role and open state", () => {
        expect(resolveCombobox({ open: true }).attributes.role).toBe("combobox");
        const box = createComboboxController({ defaultOpen: false });
        box.setOpen(true);
        expect(box.resolve().open).toBe(true);
    });
});
