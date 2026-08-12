import { describe, expect, it, vi } from "vitest";
import {
    createCommandPaletteController,
    filterCommandPaletteCommands,
    getCommandPaletteKeyboardAction,
    resolveCommandPalette,
} from "./index.js";

describe("command-palette", () => {
    it("filters commands by label and keywords", () => {
        const commands = [
            { id: "1", label: "Open file", keywords: ["docs"] },
            { id: "2", label: "Save", disabled: true },
        ];
        expect(filterCommandPaletteCommands(commands, "doc").map((c) => c.id)).toEqual(["1"]);
        expect(filterCommandPaletteCommands(commands, "").length).toBe(2);
    });

    it("moves active item and selects", () => {
        const onSelect = vi.fn();
        const content = document.createElement("div");
        document.body.append(content);
        const controller = createCommandPaletteController({
            defaultOpen: true,
            commands: [
                { id: "a", label: "Alpha" },
                { id: "b", label: "Beta" },
                { id: "c", label: "Gamma", disabled: true },
            ],
            getContent: () => content,
            onSelect,
        });
        expect(controller.getActiveId()).toBe("a");
        controller.moveActive(1);
        expect(controller.getActiveId()).toBe("b");
        controller.selectActive();
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
        expect(controller.open.get()).toBe(false);
        expect(resolveCommandPalette({ open: true }).attributes.role).toBe("dialog");
        expect(getCommandPaletteKeyboardAction({ key: "ArrowDown" }, { open: true })).toBe(
            "next",
        );
        expect(
            getCommandPaletteKeyboardAction(
                { key: "Enter", isComposing: true },
                { open: true },
            ),
        ).toBeUndefined();
        controller.dispose();
        content.remove();
    });
});
