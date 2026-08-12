import { describe, expect, it, vi } from "vitest";
import {
    createPermissionMatrixController,
    permissionMatrixKey,
    resolvePermissionMatrix,
    resolvePermissionMatrixCell,
} from "./index.js";

const resources = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];
const actions = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
];

describe("resolvePermissionMatrix", () => {
    it("resolves grid counts and read-only state", () => {
        const view = resolvePermissionMatrix({
            resourceCount: 2,
            actionCount: 3,
            readOnly: true,
            label: "Roles",
        });
        expect(view.attributes.role).toBe("grid");
        expect(view.attributes["aria-rowcount"]).toBe("3");
        expect(view.attributes["aria-colcount"]).toBe("4");
        expect(view.attributes["aria-readonly"]).toBe("true");
        expect(view.attributes["aria-label"]).toBe("Roles");
    });

    it("flags an empty matrix", () => {
        expect(resolvePermissionMatrix().attributes["data-empty"]).toBe("true");
        expect(
            resolvePermissionMatrix({ resourceCount: 1, actionCount: 1 }).attributes["data-empty"],
        ).toBe("false");
    });
});

describe("resolvePermissionMatrixCell", () => {
    it("maps state to aria-checked", () => {
        expect(
            resolvePermissionMatrixCell({ resourceId: "posts", actionId: "read", state: "allowed" })
                .attributes["aria-checked"],
        ).toBe("true");
        expect(
            resolvePermissionMatrixCell({ resourceId: "posts", actionId: "read", state: "denied" })
                .attributes["aria-checked"],
        ).toBe("false");
        expect(
            resolvePermissionMatrixCell({
                resourceId: "posts",
                actionId: "read",
                state: "indeterminate",
            }).attributes["aria-checked"],
        ).toBe("mixed");
    });

    it("resolves roving tabindex, indices, and disabled cells", () => {
        const view = resolvePermissionMatrixCell({
            resourceId: "posts",
            actionId: "write",
            state: "denied",
            focused: true,
            rowIndex: 1,
            columnIndex: 0,
            disabled: true,
        });
        expect(view.attributes.tabindex).toBe("0");
        expect(view.attributes["aria-rowindex"]).toBe("3");
        expect(view.attributes["aria-colindex"]).toBe("2");
        expect(view.attributes["aria-disabled"]).toBe("true");
        expect(view.attributes["aria-label"]).toBe("write on posts");
    });
});

describe("createPermissionMatrixController", () => {
    it("derives cell state from the can() callback", () => {
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            can: (resourceId, actionId) => resourceId === "posts" && actionId === "read",
        });
        expect(matrix.getCellState("posts", "read")).toBe("allowed");
        expect(matrix.getCellState("posts", "write")).toBe("denied");
        matrix.dispose();
    });

    it("reports indeterminate for unknown baselines and unknown cells", () => {
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            can: (_resourceId, actionId) => (actionId === "read" ? true : undefined),
        });
        expect(matrix.getCellState("posts", "write")).toBe("indeterminate");
        expect(matrix.getCellState("unknown", "read")).toBe("indeterminate");
        expect(matrix.isCellDisabled("unknown", "read")).toBe(true);
        matrix.dispose();
    });

    it("toggles, overrides, and clears cells", () => {
        const onValueChange = vi.fn();
        const onAnnounce = vi.fn();
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            can: () => false,
            onValueChange,
            onAnnounce,
        });
        matrix.toggleCell("posts", "write");
        expect(matrix.getCellState("posts", "write")).toBe("allowed");
        expect(matrix.getValue()[permissionMatrixKey("posts", "write")]).toBe(true);
        expect(onAnnounce).toHaveBeenCalledWith("write on posts allowed");
        matrix.toggleCell("posts", "write");
        expect(matrix.getCellState("posts", "write")).toBe("denied");
        matrix.clearCell("posts", "write");
        expect(matrix.getValue()[permissionMatrixKey("posts", "write")]).toBeUndefined();
        expect(onValueChange).toHaveBeenCalled();
        matrix.dispose();
    });

    it("refuses edits when read-only, per-cell disabled, or disposed", () => {
        const readOnly = createPermissionMatrixController({ resources, actions, readOnly: true });
        readOnly.toggleCell("posts", "read");
        expect(readOnly.getValue()).toEqual({});
        readOnly.dispose();

        const guarded = createPermissionMatrixController({
            resources,
            actions,
            isCellDisabled: (_resourceId, actionId) => actionId === "write",
        });
        guarded.toggleCell("posts", "write");
        expect(guarded.getValue()).toEqual({});
        guarded.toggleCell("posts", "read");
        expect(guarded.getValue()[permissionMatrixKey("posts", "read")]).toBe(true);
        guarded.dispose();
        guarded.toggleCell("users", "read");
        expect(guarded.getValue()[permissionMatrixKey("users", "read")]).toBeUndefined();
    });

    it("lists granted keys from baseline and overrides", () => {
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            can: (resourceId) => resourceId === "posts",
        });
        matrix.setCell("users", "read", true);
        expect(matrix.getGrantedKeys()).toEqual(["posts:read", "posts:write", "users:read"]);
        matrix.dispose();
    });

    it("navigates the grid with keyboard and clamps focus", () => {
        const matrix = createPermissionMatrixController({ resources, actions });
        expect(matrix.getKeyboardAction({ key: "ArrowDown" })).toEqual({
            type: "move",
            position: { row: 1, column: 0 },
        });
        expect(matrix.getFocusedCell()).toEqual({ row: 1, column: 0 });
        expect(matrix.getKeyboardAction({ key: "ArrowDown" })).toBeUndefined();
        expect(matrix.getKeyboardAction({ key: "ArrowLeft" }, "rtl")).toEqual({
            type: "move",
            position: { row: 1, column: 1 },
        });
        expect(matrix.getKeyboardAction({ key: " " })).toEqual({ type: "toggle" });
        matrix.setFocusedCell({ row: 99, column: 99 });
        expect(matrix.getFocusedCell()).toEqual({ row: 1, column: 1 });
        matrix.dispose();
    });

    it("resolves its own root and cell view models", () => {
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            can: () => true,
        });
        const root = matrix.resolve();
        expect(root.attributes["aria-rowcount"]).toBe("3");
        const cell = matrix.resolveCell("users", "write");
        expect(cell.state).toBe("allowed");
        expect(cell.attributes["aria-rowindex"]).toBe("3");
        expect(cell.attributes["aria-colindex"]).toBe("3");
        expect(cell.attributes.tabindex).toBe("-1");
        expect(matrix.resolveCell("posts", "read").attributes.tabindex).toBe("0");
        matrix.dispose();
    });

    it("supports controlled values", () => {
        const value = { [permissionMatrixKey("posts", "read")]: true };
        const onValueChange = vi.fn();
        const matrix = createPermissionMatrixController({
            resources,
            actions,
            value,
            onValueChange,
        });
        expect(matrix.getCellState("posts", "read")).toBe("allowed");
        matrix.toggleCell("posts", "read");
        expect(onValueChange).toHaveBeenCalled();
        expect(matrix.getCellState("posts", "read")).toBe("allowed");
        matrix.dispose();
    });
});
