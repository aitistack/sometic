import { describe, expect, it } from "vitest";
import { minLength, required } from "@sometic/validation";
import {
    buildSchemaFormDefaults,
    createSchemaForm,
    defaultValueForSchemaFieldType,
    listSchemaFieldNames,
    type SchemaFieldDescriptor,
} from "./index.js";

const fields: SchemaFieldDescriptor[] = [
    { name: "email", label: "Email", type: "email", validators: [required()] },
    { name: "age", label: "Age", type: "number" },
    { name: "subscribe", label: "Subscribe", type: "checkbox" },
];

describe("schema defaults", () => {
    it("maps field types to empty values", () => {
        expect(defaultValueForSchemaFieldType("number")).toBeNull();
        expect(defaultValueForSchemaFieldType("checkbox")).toBe(false);
        expect(defaultValueForSchemaFieldType("text")).toBe("");
        expect(defaultValueForSchemaFieldType(undefined)).toBe("");
    });

    it("builds default values from descriptors", () => {
        expect(buildSchemaFormDefaults(fields)).toEqual({
            email: "",
            age: null,
            subscribe: false,
        });
    });

    it("honors explicit descriptor defaults", () => {
        expect(buildSchemaFormDefaults([{ name: "role", defaultValue: "admin" }])).toEqual({
            role: "admin",
        });
    });

    it("lists field names", () => {
        expect(listSchemaFieldNames(fields)).toEqual(["email", "age", "subscribe"]);
    });
});

describe("createSchemaForm", () => {
    it("seeds values and registers every field", () => {
        const form = createSchemaForm({ fields });
        expect(form.getValues()).toEqual({ email: "", age: null, subscribe: false });
        expect(form.getFields()).toHaveLength(3);
        expect(form.getField("age")?.label).toBe("Age");
        expect(form.getField("missing")).toBeUndefined();
        expect(form.registerAll().map((entry) => entry.name)).toEqual([
            "email",
            "age",
            "subscribe",
        ]);
        form.dispose();
    });

    it("lets explicit defaultValues win over descriptors", () => {
        const form = createSchemaForm({ fields, defaultValues: { email: "ada@example.com" } });
        expect(form.getValue("email")).toBe("ada@example.com");
        expect(form.getValue("subscribe")).toBe(false);
        form.dispose();
    });

    it("validates registered descriptor validators", async () => {
        const form = createSchemaForm({
            fields: [{ name: "email", validators: [required("Email is required")] }],
        });
        expect(await form.validateForm()).toBe(false);
        expect(form.getFieldMeta("email").error).toBe("Email is required");
        form.setValue("email", "ada@example.com");
        expect(await form.validateForm()).toBe(true);
        form.dispose();
    });

    it("keeps values when the schema changes mid-edit", () => {
        const form = createSchemaForm({ fields });
        form.setValue("email", "grace@example.com", { validate: false });
        form.setFields([
            { name: "email", type: "email" },
            { name: "team", type: "text", defaultValue: "core" },
        ]);
        expect(form.getValue("email")).toBe("grace@example.com");
        expect(form.getValue("team")).toBe("core");
        expect(listSchemaFieldNames(form.getFields())).toEqual(["email", "team"]);
        form.dispose();
    });

    it("drops validation for removed fields", async () => {
        const form = createSchemaForm({
            fields: [
                { name: "email", validators: [required()] },
                { name: "nickname", validators: [minLength(4)] },
            ],
            defaultValues: { email: "ada@example.com", nickname: "ab" },
        });
        expect(await form.validateForm()).toBe(false);
        form.setFields([{ name: "email", validators: [required()] }]);
        expect(await form.validateForm()).toBe(true);
        form.dispose();
    });

    it("registers unknown names without a descriptor", () => {
        const form = createSchemaForm({ fields });
        expect(form.registerField("extra").name).toBe("extra");
        expect(form.registerField("email").value).toBe("");
        form.dispose();
    });

    it("supports submit handlers from the shared form engine", async () => {
        const form = createSchemaForm({
            fields: [{ name: "email", validators: [required()] }],
            defaultValues: { email: "ada@example.com" },
        });
        let submitted: unknown;
        await form.handleSubmit({
            onValid: (values) => {
                submitted = values;
            },
        })();
        expect(submitted).toEqual({ email: "ada@example.com" });
        form.dispose();
    });
});
