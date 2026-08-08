import { describe, expect, it } from "vitest";
import { createDateFnsDateAdapter } from "./index.js";

describe("createDateFnsDateAdapter", () => {
    const adapter = createDateFnsDateAdapter();

    it("roundtrips serialize/deserialize", () => {
        const date = new Date(2024, 0, 15);
        expect(adapter.serialize(date)).toBe("2024-01-15");
        const parsed = adapter.deserialize("2024-01-15");
        expect(parsed.valid).toBe(true);
        expect(parsed.date?.getDate()).toBe(15);
    });

    it("adds months and years", () => {
        const a = new Date(2024, 0, 1);
        expect(adapter.add(a, 1, "month").getMonth()).toBe(1);
        expect(adapter.add(a, 1, "year").getFullYear()).toBe(2025);
    });
});
