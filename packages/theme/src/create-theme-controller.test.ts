import { describe, expect, it, vi } from "vitest";
import { createMemoryStorage } from "@sometic/store/persistent";
import { applyThemeToElement, createThemeController } from "./create-theme-controller.js";
import { createScopedThemeController } from "./scoped.js";
import { darkTheme, lightTheme } from "./presets/index.js";

describe("createThemeController", () => {
    it("resolves light theme tokens and css variables", () => {
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "light",
        });
        const snapshot = theme.get();
        expect(snapshot.resolvedThemeId).toBe("light");
        expect(snapshot.resolvedColorScheme).toBe("light");
        expect(snapshot.cssVariables["--sometic-color-primary"]).toBe("#2563eb");
        expect(snapshot.attributes["data-theme"]).toBe("light");
        expect(snapshot.attributes.dir).toBe("ltr");
        theme.dispose();
    });

    it("switches mode and density/direction", () => {
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "light",
        });
        theme.setMode("dark");
        expect(theme.get().resolvedThemeId).toBe("dark");
        theme.setDensity("compact");
        theme.setDirection("rtl");
        expect(theme.get().attributes["data-density"]).toBe("compact");
        expect(theme.get().attributes.dir).toBe("rtl");
        theme.dispose();
    });

    it("registers themes and persists preferences", async () => {
        const storage = createMemoryStorage();
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "light",
            persist: true,
            storage,
            storageKey: "theme-test",
        });
        await theme.hydrated;
        theme.setMode("dark");
        theme.setDensity("spacious");
        await new Promise((resolve) => setTimeout(resolve, 0));
        theme.dispose();

        const again = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            persist: true,
            storage,
            storageKey: "theme-test",
        });
        await again.hydrated;
        expect(again.get().preferences.mode).toBe("dark");
        expect(again.get().preferences.density).toBe("spacious");
        again.dispose();
    });

    it("applyThemeToElement sets variables and attributes", () => {
        const styles = new Map<string, string>();
        const attrs = new Map<string, string>();
        const element = {
            style: {
                setProperty(name: string, value: string) {
                    styles.set(name, value);
                },
                removeProperty(name: string) {
                    styles.delete(name);
                },
            },
            setAttribute(name: string, value: string) {
                attrs.set(name, value);
            },
            removeAttribute(name: string) {
                attrs.delete(name);
            },
        };
        const theme = createThemeController({
            themes: [lightTheme],
            defaultThemeId: "light",
            mode: "light",
            reducedMotion: true,
        });
        applyThemeToElement(element, theme.get());
        expect(styles.get("--sometic-color-bg")).toBe("#ffffff");
        expect(styles.get("color-scheme")).toBe("light");
        expect(attrs.get("data-theme")).toBe("light");
        expect(attrs.get("data-reduced-motion")).toBe("true");
        theme.dispose();
    });

    it("does not notify when snapshot is unchanged", () => {
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            mode: "light",
        });
        const listener = vi.fn();
        theme.subscribe(listener);
        theme.setMode("light");
        theme.setDensity("comfortable");
        expect(listener).not.toHaveBeenCalled();
        theme.setMode("dark");
        expect(listener).toHaveBeenCalledTimes(1);
        theme.dispose();
    });

    it("createScopedThemeController merges override tokens onto parent", () => {
        const parent = createThemeController({
            themes: [lightTheme],
            defaultThemeId: "light",
            mode: "light",
        });
        const scoped = createScopedThemeController({
            parent,
            tokens: {
                color: {
                    primary: "#ff0000",
                },
            },
        });
        expect(scoped.get().tokens.color?.primary).toBe("#ff0000");
        expect(scoped.get().tokens.color?.bg).toBe("#ffffff");
        expect(scoped.get().cssVariables["--sometic-color-primary"]).toBe("#ff0000");
        scoped.dispose();
        parent.dispose();
    });
});
