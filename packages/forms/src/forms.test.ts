import { describe, expect, it, vi } from "vitest";
import { createIssue, minLength, required } from "@sometic/validation";
import { createForm } from "./create-form.js";
import { createDraftController, createMemoryDraftStorage } from "./drafts/index.js";
import { createFormSteps } from "./steps/index.js";
import { formDataToValues, valuesToFormData } from "./form-data/index.js";
import { focusFirstInvalid, formatIssueSummary } from "./a11y/index.js";

describe("createForm", () => {
    it("tracks dirty touched and validates sync fields", async () => {
        const form = createForm({
            defaultValues: { email: "", password: "" },
            validationMode: "onBlur",
        });
        form.register("email", { validators: [required(), minLength(3)] });
        form.register("password", { validators: [required()] });
        form.setValue("email", "ab");
        expect(form.getFieldMeta("email").dirty).toBe(true);
        const field = form.register("email");
        field.onBlur();
        await vi.waitFor(() => {
            expect(form.getFieldMeta("email").invalid).toBe(true);
        });
        form.setValue("email", "user@example.com");
        await form.validateField("email");
        expect(form.getFieldMeta("email").valid).toBe(true);
        form.dispose();
    });

    it("supports field arrays", () => {
        const form = createForm({
            defaultValues: { items: [{ name: "a" }] as Array<{ name: string }> },
        });
        const array = form.createFieldArray<{ name: string }>("items", {
            defaultItem: { name: "" },
        });
        array.append({ name: "b" });
        expect(form.getValues().items).toHaveLength(2);
        array.move(1, 0);
        expect(form.getValues().items[0]?.name).toBe("b");
        array.remove(0);
        expect(form.getValues().items).toHaveLength(1);
        form.dispose();
    });

    it("is race-safe for async validation", async () => {
        const form = createForm({
            defaultValues: { username: "" },
            validationMode: "onChange",
            debounceMs: 0,
        });
        let resolveFirst!: (value: boolean) => void;
        const firstGate = new Promise<boolean>((resolve) => {
            resolveFirst = resolve;
        });
        form.register("username", {
            validators: [
                async (value) => {
                    if (value === "slow") {
                        await firstGate;
                        return createIssue("taken", "Taken", { path: "username" });
                    }
                    return undefined;
                },
            ],
        });
        form.setValue("username", "slow");
        const slow = form.validateField("username");
        form.setValue("username", "ok");
        await form.validateField("username");
        resolveFirst(true);
        await slow;
        expect(form.getFieldMeta("username").invalid).toBe(false);
        form.dispose();
    });

    it("maps server errors and aborts submit when invalid", async () => {
        const form = createForm({ defaultValues: { email: "a@b.c" } });
        form.register("email", { validators: [required()] });
        form.setServerErrors([createIssue("server", "Already used", { path: "email" })]);
        expect(form.getFieldMeta("email").invalid).toBe(true);
        expect(form.getFeedback().kind).toBe("error");
        const onValid = vi.fn();
        const onInvalid = vi.fn();
        await form.handleSubmit({ onValid, onInvalid })();
        expect(onValid).not.toHaveBeenCalled();
        expect(onInvalid).toHaveBeenCalled();
        expect(form.getFeedback().kind).toBe("validation");
        form.clearServerErrors(["email"]);
        form.clearFeedback();
        await form.handleSubmit({ onValid, onInvalid, successMessage: "Welcome back" })();
        expect(onValid).toHaveBeenCalled();
        expect(form.getFeedback()).toMatchObject({ kind: "success", message: "Welcome back" });
        form.dispose();
    });

    it("can disable feedback responses", async () => {
        const form = createForm({
            defaultValues: { email: "" },
            feedback: false,
        });
        form.register("email", { validators: [required()] });
        await form.handleSubmit({
            onValid: vi.fn(),
            onInvalid: vi.fn(),
        })();
        expect(form.getFeedback().kind).toBe("idle");
        form.dispose();
    });

    it("resets and partial resets", () => {
        const form = createForm({ defaultValues: { a: "1", b: "2" } });
        form.setValue("a", "x", { validate: false });
        form.setValue("b", "y", { validate: false });
        form.partialReset(["a"]);
        expect(form.getValue("a")).toBe("1");
        expect(form.getValue("b")).toBe("y");
        form.reset();
        expect(form.getValues()).toEqual({ a: "1", b: "2" });
        form.dispose();
    });
});

describe("drafts", () => {
    it("saves and loads versioned drafts", async () => {
        const storage = createMemoryDraftStorage();
        let values = { name: "Ada" };
        const drafts = createDraftController({
            key: "demo",
            version: 1,
            storage,
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
        });
        await drafts.save();
        values = { name: "" };
        const loaded = await drafts.load();
        expect(loaded).toEqual({ name: "Ada" });
        expect(values.name).toBe("Ada");
        drafts.dispose();
    });

    it("omits sensitive fields before persist", async () => {
        const storage = createMemoryDraftStorage();
        let values = { email: "a@b.c", password: "secret", note: "hi" };
        const drafts = createDraftController({
            key: "secure",
            version: 1,
            storage,
            getValues: () => values,
            setValues: (next) => {
                values = next as typeof values;
            },
            omit: ["password"],
        });
        await drafts.save();
        const raw = await storage.getItem("secure");
        expect(raw).toBeTruthy();
        expect(raw).not.toContain("secret");
        expect(raw).toContain("a@b.c");
        drafts.dispose();
    });
});

describe("steps", () => {
    it("gates next on step fields and supports rich field defs", async () => {
        const form = createForm({
            defaultValues: { email: "", name: "" },
        });
        form.register("email", { validators: [required()] });
        form.register("name", { validators: [required()] });
        const steps = createFormSteps({
            form,
            steps: [
                {
                    id: "account",
                    title: "Account",
                    fields: [{ name: "email", label: "Email", type: "email" }],
                },
                {
                    id: "profile",
                    title: "Profile",
                    fields: [{ name: "name", label: "Full name" }],
                },
            ],
        });
        expect(steps.getStepFields()[0]?.label).toBe("Email");
        expect(await steps.next()).toBe(false);
        expect(form.getFeedback().kind).toBe("validation");
        form.setValue("email", "a@b.c", { validate: false });
        expect(await steps.next()).toBe(true);
        expect(steps.getStep().id).toBe("profile");
        form.dispose();
    });
});

describe("form-data", () => {
    it("round trips nested values", () => {
        const values = { user: { email: "a@b.c" }, tags: ["x", "y"] };
        const data = valuesToFormData(values);
        const parsed = formDataToValues(data);
        expect(parsed.user).toEqual({ email: "a@b.c" });
        expect(parsed.tags).toEqual(["x", "y"]);
    });
});

describe("a11y", () => {
    it("formats summary and focuses invalid", () => {
        expect(formatIssueSummary([])).toBe("");
        expect(formatIssueSummary([createIssue("required", "Required", { path: "a" })])).toContain(
            "Required",
        );
        document.body.innerHTML = `<input name="email" /><input name="password" aria-invalid="true" />`;
        expect(
            focusFirstInvalid(document, [
                createIssue("required", "Required", { path: "password" }),
            ]),
        ).toBe(true);
        expect(document.activeElement?.getAttribute("name")).toBe("password");
    });
});
