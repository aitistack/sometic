import { describe, expect, it, vi } from "vitest";
import { observeMutations, observeResize } from "./index.js";

describe("observers", () => {
    it("observeResize disconnects on dispose", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);
        const callback = vi.fn();
        const observer = observeResize(target, callback);
        expect(observer.disposed).toBe(false);
        observer.dispose();
        expect(observer.disposed).toBe(true);
        target.remove();
    });

    it("observeMutations reports childList changes", async () => {
        const root = document.createElement("div");
        document.body.appendChild(root);
        const seen = vi.fn();
        const observer = observeMutations(root, seen, { childList: true });
        root.appendChild(document.createElement("span"));
        await vi.waitFor(() => {
            expect(seen).toHaveBeenCalled();
        });
        observer.dispose();
        root.remove();
    });
});
