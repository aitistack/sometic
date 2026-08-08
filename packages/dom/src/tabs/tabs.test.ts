import { describe, expect, it } from "vitest";
import { createTabsController, resolveTabTrigger } from "./index.js";

describe("tabs", () => {
    it("tracks selected trigger", () => {
        const tabs = createTabsController({ defaultValue: "a" });
        expect(tabs.resolveTrigger({ value: "a" }).selected).toBe(true);
        tabs.setValue("b");
        expect(tabs.resolveTrigger({ value: "b" }).selected).toBe(true);
        expect(resolveTabTrigger({ value: "x", selected: false }).attributes.role).toBe("tab");
    });
});
