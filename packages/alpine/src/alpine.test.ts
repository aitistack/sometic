import { describe, expect, it, vi } from "vitest";
import { bindAlpineButton, createAlpineSometicPlugin, createAlpineStoreBind } from "./index.js";

describe("@sometic/alpine", () => {
    it("updates and disposes store bind", () => {
        const bind = createAlpineStoreBind({ count: 0 });
        bind.update((state) => ({ count: state.count + 1 }));
        expect(bind.get().count).toBe(1);
        bind.dispose();
    });

    it("binds button and cleans up via Alpine cleanup", () => {
        const button = document.createElement("button");
        document.body.append(button);
        const onPress = vi.fn();
        const cleanups: Array<() => void> = [];
        const binding = bindAlpineButton(
            button,
            () => ({ onPress }),
            (fn) => {
                cleanups.push(fn);
            },
        );
        button.click();
        expect(onPress).toHaveBeenCalledTimes(1);
        for (const cleanup of cleanups) {
            cleanup();
        }
        binding.dispose();
        button.click();
        expect(onPress).toHaveBeenCalledTimes(1);
        button.remove();
    });

    it("registers an Alpine directive plugin", () => {
        const directives = new Map<string, unknown>();
        const alpine = {
            directive(name: string, callback: unknown) {
                directives.set(name, callback);
            },
        };
        createAlpineSometicPlugin(() => ({}))(alpine);
        expect(directives.has("sometic-button")).toBe(true);
    });
});
