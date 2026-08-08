import { describe, expect, it } from "vitest";
import { createNativeDateAdapter } from "./index.js";

describe("createNativeDateAdapter", () => {
    const adapter = createNativeDateAdapter();

    it("serializes and deserializes date-only values", () => {
        const date = new Date(2024, 0, 15);
        const serialized = adapter.serialize(date);
        expect(serialized).toBe("2024-01-15");
        const parsed = adapter.deserialize(serialized);
        expect(parsed.valid).toBe(true);
        expect(parsed.date?.getFullYear()).toBe(2024);
        expect(parsed.date?.getMonth()).toBe(0);
        expect(parsed.date?.getDate()).toBe(15);
    });

    it("rejects invalid dates", () => {
        expect(adapter.deserialize("2024-13-40").valid).toBe(false);
        expect(adapter.parse("not-a-date").valid).toBe(false);
        expect(adapter.isValid(new Date(Number.NaN))).toBe(false);
    });

    it("compares and adds units", () => {
        const a = new Date(2024, 0, 1);
        const b = new Date(2024, 0, 2);
        expect(adapter.compare(a, b)).toBeLessThan(0);
        expect(adapter.add(a, 1, "day").getDate()).toBe(2);
        expect(adapter.add(a, 1, "month").getMonth()).toBe(1);
        expect(adapter.add(a, 1, "year").getFullYear()).toBe(2025);
    });

    it("computes startOf and endOf", () => {
        const date = new Date(2024, 5, 15, 12, 30);
        const start = adapter.startOf(date, "month");
        expect(start.getDate()).toBe(1);
        expect(start.getHours()).toBe(0);
        const end = adapter.endOf(date, "month");
        expect(end.getDate()).toBe(30);
    });
});
