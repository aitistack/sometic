import { describe, expect, it } from "vitest";
import {
    SLOT_ATTRIBUTE,
    createSlotAttributes,
    defineSlots,
    getSlotName,
    pickSlotValue,
} from "./index.js";

describe("slots", () => {
    it("defineSlots returns the same tuple", () => {
        const slots = defineSlots(["root", "content", "suffix"] as const);
        expect(slots).toEqual(["root", "content", "suffix"]);
    });

    it("createSlotAttributes sets data-slot", () => {
        expect(createSlotAttributes("root")).toEqual({ [SLOT_ATTRIBUTE]: "root" });
    });

    it("getSlotName reads data-slot", () => {
        expect(getSlotName({ [SLOT_ATTRIBUTE]: "content" })).toBe("content");
        expect(getSlotName({})).toBeUndefined();
    });

    it("pickSlotValue reads a slot map entry", () => {
        const map: Partial<Record<"root" | "content", string>> = { root: "a", content: "b" };
        expect(pickSlotValue(map, "content")).toBe("b");
        expect(pickSlotValue(undefined, "root")).toBeUndefined();
    });
});
