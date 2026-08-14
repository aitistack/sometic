import { describe, expect, it } from "vitest";
import { createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useForm, useFormField } from "./index.js";

function LoginProbe(): ReactElement {
    const form = useForm({ defaultValues: { email: "" } as Record<string, unknown> });
    const email = useFormField("email", {}, form);
    return createElement("input", {
        value: String(email.value ?? ""),
        readOnly: true,
    });
}

describe("React form hooks", () => {
    it("renders a field without an update-depth loop", async () => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        await act(async () => {
            root.render(createElement(LoginProbe));
        });
        const input = host.querySelector("input");
        expect(input).not.toBeNull();
        await act(async () => {
            root.unmount();
        });
        host.remove();
    });
});
