import { describe, expect, it, vi } from "vitest";
import {
    bindOfflineRecovery,
    resolveConflictStatus,
    resolveStatus,
    resolveStatusAction,
} from "./index.js";

describe("resolveStatus", () => {
    it("resolves empty status with polite live region", () => {
        const view = resolveStatus({ kind: "empty" });
        expect(view.kind).toBe("empty");
        expect(view.attributes.role).toBe("status");
        expect(view.attributes["aria-live"]).toBe("polite");
        expect(view.attributes["data-status"]).toBe("empty");
        expect(view.title).toBe("Nothing here yet");
    });

    it("resolves error as alert", () => {
        const view = resolveStatus({ kind: "error", title: "Failed", description: "Retry" });
        expect(view.attributes.role).toBe("alert");
        expect(view.attributes["aria-live"]).toBe("assertive");
        expect(view.title).toBe("Failed");
        expect(view.description).toBe("Retry");
    });

    it("marks missing action", () => {
        const view = resolveStatus({ kind: "offline", hasAction: false });
        expect(view.hasAction).toBe(false);
        expect(view.attributes["data-has-action"]).toBe("false");
    });
});

describe("resolveStatusAction", () => {
    it("disables action", () => {
        const view = resolveStatusAction({ disabled: true });
        expect(view.disabled).toBe(true);
        expect(view.attributes.disabled).toBe("");
    });
});

describe("resolveConflictStatus", () => {
    it("exposes dual version labels", () => {
        const view = resolveConflictStatus({
            kind: "conflict",
            versions: { localLabel: "Mine", remoteLabel: "Theirs" },
        });
        expect(view.localLabel).toBe("Mine");
        expect(view.remoteLabel).toBe("Theirs");
        expect(view.kind).toBe("conflict");
    });
});

describe("bindOfflineRecovery", () => {
    it("invokes onOnline and disposes", () => {
        const onOnline = vi.fn();
        let stored: (() => void) | undefined;
        const dispose = bindOfflineRecovery({
            onOnline,
            addEventListener: (_type, listener) => {
                stored = listener;
            },
        });
        stored?.();
        expect(onOnline).toHaveBeenCalledTimes(1);
        dispose();
    });

    it("noops without callback", () => {
        const dispose = bindOfflineRecovery({});
        dispose();
    });
});
