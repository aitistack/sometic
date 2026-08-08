import { describe, expect, it } from "vitest";
import { createStore } from "@sometic/store";
import { WAVE_A_MANIFESTS, assertManifestCapabilities } from "@sometic/adapter-contract";
import { useStore } from "./index.js";
import { AsyncButton, Button } from "../button/index.js";
import { Form, FormProvider, useForm, useFormContext } from "../form/index.js";

describe("vue adapter contract", () => {
    it("claims wave A capabilities", () => {
        const vue = WAVE_A_MANIFESTS.find((item) => item.id === "vue");
        expect(vue).toBeDefined();
        assertManifestCapabilities(vue!, ["button", "storeBind", "form"]);
    });

    it("exports parity APIs", () => {
        expect(Button).toBeTruthy();
        expect(AsyncButton).toBeTruthy();
        expect(Form).toBeTruthy();
        expect(FormProvider).toBeTruthy();
        expect(typeof useForm).toBe("function");
        expect(typeof useFormContext).toBe("function");
        expect(typeof useStore).toBe("function");
    });

    it("store updates for bind fixture", () => {
        const store = createStore({ count: 0 });
        store.update((state) => ({ count: state.count + 1 }));
        expect(store.get().count).toBe(1);
        store.dispose();
    });
});
