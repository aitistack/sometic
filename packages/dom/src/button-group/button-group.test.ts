import { describe, expect, it } from "vitest";
import { resolveButtonGroup } from "./index.js";

describe("button-group", () => {
    it("sets role and orientation", () => {
        const view = resolveButtonGroup({ orientation: "vertical", disabled: true });
        expect(view.attributes.role).toBe("group");
        expect(view.attributes["data-orientation"]).toBe("vertical");
        expect(view.attributes["data-disabled"]).toBe("true");
    });
});
