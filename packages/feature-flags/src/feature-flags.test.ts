import { describe, expect, it, vi } from "vitest";
import { createFeatureFlagController } from "./feature-flags.js";

describe("createFeatureFlagController", () => {
    it("evaluates defaults, remote, and overrides with precedence", () => {
        const flags = createFeatureFlagController({
            flags: [
                { key: "beta", defaultValue: false, defaultVariant: "off" },
                { key: "theme", defaultValue: true, defaultVariant: "light" },
            ],
            remote: { beta: { enabled: true, variant: "remote" } },
            overrides: { theme: { enabled: false, variant: "dark" } },
        });

        expect(flags.isEnabled("beta")).toBe(true);
        expect(flags.getVariant("beta")).toBe("remote");
        expect(flags.getSnapshot("beta").source).toBe("remote");
        expect(flags.isEnabled("theme")).toBe(false);
        expect(flags.getVariant("theme")).toBe("dark");
        expect(flags.getSnapshot("theme").source).toBe("override");
        expect(flags.list()).toHaveLength(2);
        flags.dispose();
    });

    it("falls back to defaultValue when override omits enabled or variant", () => {
        const flags = createFeatureFlagController({
            flags: [{ key: "beta", defaultValue: true, defaultVariant: "a" }],
            overrides: { beta: {} },
        });

        expect(flags.getSnapshot("beta")).toEqual({
            key: "beta",
            enabled: true,
            variant: "a",
            source: "override",
        });
        flags.dispose();
    });

    it("rejects empty definitions, duplicate keys, and invalid keys", () => {
        expect(() => createFeatureFlagController({ flags: [] })).toThrow(
            /At least one feature flag/,
        );
        expect(() =>
            createFeatureFlagController({
                flags: [
                    { key: "a", defaultValue: true },
                    { key: "a", defaultValue: false },
                ],
            }),
        ).toThrow(/Duplicate feature flag key/);
        expect(() =>
            createFeatureFlagController({ flags: [{ key: "  ", defaultValue: true }] }),
        ).toThrow(/non-empty string/);
        expect(() =>
            createFeatureFlagController({ flags: [{ key: "", defaultValue: true }] }),
        ).toThrow(/non-empty string/);
    });

    it("throws for unknown keys on read and override", () => {
        const flags = createFeatureFlagController({
            flags: [{ key: "beta", defaultValue: false }],
        });

        expect(() => flags.isEnabled("missing")).toThrow(/Unknown feature flag/);
        expect(() => flags.getVariant("missing")).toThrow(/Unknown feature flag/);
        expect(() => flags.getSnapshot("missing")).toThrow(/Unknown feature flag/);
        expect(() => flags.setOverride("missing", { enabled: true })).toThrow(
            /Unknown feature flag/,
        );
        expect(() => flags.isEnabled("")).toThrow(/non-empty string/);
        flags.dispose();
    });

    it("updates overrides and remote and notifies subscribers", () => {
        const onChange = vi.fn();
        const flags = createFeatureFlagController({
            flags: [{ key: "beta", defaultValue: false }],
            onChange,
        });
        const listener = vi.fn();
        const stop = flags.subscribe(listener);

        flags.setOverride("beta", { enabled: true, variant: "on" });
        expect(flags.isEnabled("beta")).toBe(true);
        expect(onChange).toHaveBeenCalled();
        expect(listener).toHaveBeenCalled();

        flags.setOverride("beta", null);
        expect(flags.getSnapshot("beta").source).toBe("default");

        flags.setRemote({ beta: { enabled: true } });
        expect(flags.getSnapshot("beta").source).toBe("remote");

        flags.clearOverrides();
        flags.setOverride("beta", { enabled: false });
        flags.clearOverrides();
        expect(flags.getSnapshot("beta").source).toBe("remote");

        stop();
        listener.mockClear();
        flags.setRemote({});
        expect(listener).not.toHaveBeenCalled();
        flags.dispose();
    });

    it("rejects work after dispose", () => {
        const flags = createFeatureFlagController({
            flags: [{ key: "beta", defaultValue: false }],
        });
        flags.dispose();

        expect(flags.disposed).toBe(true);
        expect(() => flags.isEnabled("beta")).toThrow(/disposed/);
        expect(() => flags.list()).toThrow(/disposed/);
        expect(() => flags.setOverride("beta", { enabled: true })).toThrow(/disposed/);
        expect(() => flags.setRemote({})).toThrow(/disposed/);
        expect(() => flags.clearOverrides()).toThrow(/disposed/);
        expect(() => flags.subscribe(() => undefined)).toThrow(/disposed/);
    });
});
