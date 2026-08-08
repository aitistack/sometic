import { describe, expect, it } from "vitest";
import { assertDateAdapter, type DateAdapter } from "./index.js";

describe("date-core", () => {
    it("assertDateAdapter accepts a complete adapter", () => {
        const adapter: DateAdapter = {
            parse: () => ({ date: null, valid: false }),
            format: () => "",
            isValid: () => false,
            compare: () => 0,
            add: (date) => date,
            startOf: (date) => date,
            endOf: (date) => date,
            serialize: () => "",
            deserialize: () => ({ date: null, valid: false }),
        };
        expect(() => assertDateAdapter(adapter)).not.toThrow();
    });

    it("assertDateAdapter rejects incomplete adapters", () => {
        expect(() => assertDateAdapter({} as DateAdapter)).toThrow(/missing method/);
    });
});
