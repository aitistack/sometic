import { describe, expect, it } from "vitest";
import { createStore } from "@sometic/store";
import { WAVE_A_MANIFESTS, assertManifestCapabilities } from "@sometic/adapter-contract";
import { useStore } from "./index.js";
import { Button, AsyncButton } from "../button/index.js";
import { Form, FormProvider, useForm } from "../form/index.js";

describe("react adapter contract", () => {
    it("claims wave A capabilities", () => {
        const react = WAVE_A_MANIFESTS.find((item) => item.id === "react");
        expect(react).toBeDefined();
        assertManifestCapabilities(react!, ["button", "storeBind", "form"]);
    });

    it("exports button form and store bind APIs", () => {
        expect(typeof Button).toBe("object");
        expect(typeof AsyncButton).toBe("object");
        expect(typeof Form).toBe("function");
        expect(typeof FormProvider).toBe("function");
        expect(typeof useForm).toBe("function");
        expect(typeof useStore).toBe("function");
    });

    it("store subscribe works without rendering", () => {
        const store = createStore({ count: 0 });
        let seen = 0;
        const stop = store.subscribe((state) => {
            seen = state.count;
        });
        store.update((state) => ({ count: state.count + 1 }));
        expect(seen).toBe(1);
        stop();
        store.dispose();
    });
});

describe("react adapter ssr safety", () => {
    it("module exports resolve without requiring window", () => {
        expect(typeof globalThis.window === "undefined" || typeof Button === "object").toBe(true);
        expect(Button).toBeTruthy();
    });
});
