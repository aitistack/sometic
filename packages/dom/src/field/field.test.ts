import { describe, expect, it } from "vitest";
import { createFieldIds, resolveField } from "./index.js";

describe("resolveField", () => {
    it("wires label and describedby ids", () => {
        const ids = createFieldIds("demo");
        const view = resolveField({
            ids,
            hasDescription: true,
            hasError: true,
            invalid: true,
            required: true,
        });
        expect(view.labelAttributes.for).toBe(ids.id);
        expect(view.controlAttributes["aria-labelledby"]).toBe(ids.labelId);
        expect(view.controlAttributes["aria-describedby"]).toBe(
            `${ids.descriptionId} ${ids.errorId}`,
        );
        expect(view.controlAttributes["aria-invalid"]).toBe("true");
        expect(view.controlAttributes["aria-required"]).toBe("true");
        expect(view.attributes["data-invalid"]).toBe("true");
    });
});
