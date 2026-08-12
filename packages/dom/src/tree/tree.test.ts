import { describe, expect, it } from "vitest";
import {
    createTreeController,
    flattenVisibleTreeItems,
    getTreeKeyboardAction,
    shouldMountTreeChildren,
} from "./index.js";

const items = [
    {
        id: "root",
        label: "Root",
        children: [
            { id: "child", label: "Child" },
            { id: "disabled", label: "Disabled", disabled: true },
        ],
    },
];

describe("tree", () => {
    it("flattens visible nodes based on expansion", () => {
        expect(flattenVisibleTreeItems(items, new Set()).map((n) => n.item.id)).toEqual(["root"]);
        expect(
            flattenVisibleTreeItems(items, new Set(["root"])).map((n) => n.item.id),
        ).toEqual(["root", "child", "disabled"]);
    });

    it("expands, selects, and handles keyboard", () => {
        const tree = createTreeController({
            items,
            defaultValue: "root",
            defaultExpanded: [],
        });
        tree.expand("root");
        expect(tree.isExpanded("root")).toBe(true);
        const nodes = tree.getVisibleNodes();
        expect(
            getTreeKeyboardAction(
                { key: "ArrowDown" },
                { nodes, selected: "root", expanded: new Set(["root"]) },
            ),
        ).toEqual({ focus: "child", select: "child" });
        expect(
            getTreeKeyboardAction(
                { key: "ArrowRight" },
                { nodes: flattenVisibleTreeItems(items, new Set()), selected: "root", expanded: new Set() },
            ),
        ).toEqual({ expand: "root" });
        expect(shouldMountTreeChildren({ expanded: false, lazyMount: true })).toBe(false);
        expect(tree.resolveItem({ id: "root", level: 1 }).attributes.role).toBe("treeitem");
    });
});
