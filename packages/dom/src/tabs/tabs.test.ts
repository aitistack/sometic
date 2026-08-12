import { describe, expect, it, vi } from "vitest";
import {
    bindTabsKeyboard,
    createTabsController,
    getTabsKeyboardTarget,
    resolveTabTrigger,
    shouldMountTabPanel,
    syncTabsToUrl,
} from "./index.js";

describe("tabs", () => {
    it("tracks selected trigger", () => {
        const tabs = createTabsController({ defaultValue: "a" });
        expect(tabs.resolveTrigger({ value: "a" }).selected).toBe(true);
        tabs.setValue("b");
        expect(tabs.resolveTrigger({ value: "b" }).selected).toBe(true);
        expect(resolveTabTrigger({ value: "x", selected: false }).attributes.role).toBe("tab");
    });

    it("moves selection with keyboard including RTL", () => {
        const tabs = [
            { value: "a" },
            { value: "b", disabled: true },
            { value: "c" },
        ];
        expect(
            getTabsKeyboardTarget(
                { key: "ArrowRight" },
                { tabs, selected: "a", orientation: "horizontal", dir: "ltr" },
            ),
        ).toBe("c");
        expect(
            getTabsKeyboardTarget(
                { key: "ArrowLeft" },
                { tabs, selected: "a", orientation: "horizontal", dir: "rtl" },
            ),
        ).toBe("c");
        expect(
            getTabsKeyboardTarget({ key: "Home" }, { tabs, selected: "c" }),
        ).toBe("a");
        expect(
            getTabsKeyboardTarget({ key: "End" }, { tabs, selected: "a" }),
        ).toBe("c");
    });

    it("respects lazyMount panel policy", () => {
        expect(shouldMountTabPanel({ selected: false, lazyMount: true })).toBe(false);
        expect(shouldMountTabPanel({ selected: true, lazyMount: true })).toBe(true);
        expect(shouldMountTabPanel({ selected: false, forceMount: true })).toBe(true);
        expect(shouldMountTabPanel({ selected: false })).toBe(true);
    });

    it("syncs value to URL search params", () => {
        let params = new URLSearchParams("tab=a");
        let value = "a";
        const sync = syncTabsToUrl({
            getValue: () => value,
            setValue: (next) => {
                value = next;
            },
            getSearchParams: () => params,
            setSearchParams: (next) => {
                params = next;
            },
        });
        expect(value).toBe("a");
        value = "b";
        params = new URLSearchParams("tab=c");
        sync.dispose();
        const sync2 = syncTabsToUrl({
            getValue: () => value,
            setValue: (next) => {
                value = next;
            },
            getSearchParams: () => params,
            setSearchParams: (next) => {
                params = next;
            },
        });
        expect(value).toBe("c");
        sync2.dispose();
    });

    it("binds keyboard listeners and disposes them", () => {
        const a = document.createElement("button");
        const c = document.createElement("button");
        document.body.append(a, c);
        let selected = "a";
        const setSelected = vi.fn((next: string) => {
            selected = next;
        });
        const binding = bindTabsKeyboard({
            getTabs: () => [
                { value: "a", element: a },
                { value: "c", element: c },
            ],
            getSelected: () => selected,
            setSelected,
            getOrientation: () => "horizontal",
            getDir: () => "ltr",
        });
        a.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        expect(setSelected).toHaveBeenCalledWith("c");
        binding.dispose();
        a.remove();
        c.remove();
    });
});
