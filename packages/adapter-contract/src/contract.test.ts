import { describe, expect, it } from "vitest";
import {
    WAVE_A_MANIFESTS,
    WAVE_B_MANIFESTS,
    WAVE_C_MANIFESTS,
    assertManifestCapabilities,
    assertNoImportTimeWindowAccess,
    createDisposeRebindFixture,
    createStoreBindFixture,
} from "./index.js";

describe("adapter-contract", () => {
    it("lists wave A manifests with button capability for react/vue", () => {
        const react = WAVE_A_MANIFESTS.find((item) => item.id === "react");
        const vue = WAVE_A_MANIFESTS.find((item) => item.id === "vue");
        expect(react).toBeDefined();
        expect(vue).toBeDefined();
        assertManifestCapabilities(react!, ["button", "storeBind", "form"]);
        assertManifestCapabilities(vue!, ["button", "storeBind", "form"]);
    });

    it("lists wave B manifests as storeBind-only foundation", () => {
        for (const manifest of WAVE_B_MANIFESTS) {
            assertManifestCapabilities(manifest, ["storeBind"]);
            expect(manifest.capabilities).toEqual(["storeBind"]);
        }
    });

    it("lists wave C manifests with storeBind and button", () => {
        for (const manifest of WAVE_C_MANIFESTS) {
            assertManifestCapabilities(manifest, ["storeBind", "button"]);
            expect(manifest.capabilities).toEqual(["storeBind", "button"]);
        }
        expect(WAVE_C_MANIFESTS.map((item) => item.id).sort()).toEqual([
            "alpine",
            "htmx",
            "jquery",
        ]);
    });

    it("provides store bind fixture, dispose fixture, and SSR contract helper", () => {
        const fixture = createStoreBindFixture({ count: 0 });
        expect(fixture.increments).toBe(3);
        expect(createDisposeRebindFixture()).toEqual({ bindCount: 0, disposeCount: 0 });
        assertNoImportTimeWindowAccess(false);
        expect(() => assertNoImportTimeWindowAccess(true as never)).toThrow();
    });
});
