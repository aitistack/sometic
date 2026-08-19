import { bench, describe } from "vitest";
import { createStore } from "@sometic/store";
import { applyThemeToElement, createThemeController } from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";
import { createForm } from "@sometic/forms";
import { createQueryClient } from "@sometic/query";

describe("runtime benches", () => {
    bench("store subscribe and set", () => {
        const store = createStore({ n: 0 });
        store.subscribe(() => undefined);
        store.set({ n: 1 });
        store.dispose();
    });

    bench("theme apply and dispose", () => {
        const theme = createThemeController({
            themes: [lightTheme, darkTheme],
            defaultThemeId: "light",
            darkThemeId: "dark",
            mode: "light",
        });
        const styles = new Map<string, string>();
        const element: {
            style: {
                setProperty(name: string, value: string): void;
                removeProperty(name: string): void;
            };
            setAttribute(name: string, value: string): void;
            removeAttribute(name: string): void;
        } = {
            style: {
                setProperty(name, value) {
                    styles.set(name, value);
                },
                removeProperty(name) {
                    styles.delete(name);
                },
            },
            setAttribute() {
                return undefined;
            },
            removeAttribute() {
                return undefined;
            },
        };
        applyThemeToElement(element, theme.get());
        theme.dispose();
        theme.dispose();
    });

    bench("form field setValue", () => {
        const form = createForm({ defaultValues: { email: "" } });
        form.setValue("email", "user@example.com");
        form.dispose();
    });

    bench("query cache setQueryData", () => {
        const client = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        client.setQueryData(["k"], { ok: true });
        client.dispose();
    });
});
