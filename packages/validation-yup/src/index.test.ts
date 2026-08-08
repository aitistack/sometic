import { describe, expect, it } from "vitest";
import { fromSchema } from "@sometic/validation/schema";
import { runValidators } from "@sometic/validation/validators";
import * as yup from "yup";
import { createYupSchemaAdapter } from "./index.js";

describe("createYupSchemaAdapter", () => {
    it("maps yup issues to Sometic paths", () => {
        const adapter = createYupSchemaAdapter(
            yup.object({
                user: yup.object({
                    email: yup.string().email().required(),
                }),
            }),
        );
        const result = adapter.safeParse({ user: { email: "nope" } });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues.some((issue) => issue.path === "user.email")).toBe(true);
        }
    });

    it("works with fromSchema validators", async () => {
        const adapter = createYupSchemaAdapter(yup.string().min(3).required());
        const outcome = await runValidators([fromSchema(adapter)], "ab", {
            values: {},
            path: "name",
        });
        expect(outcome.valid).toBe(false);
        expect(outcome.issues[0]?.path).toBe("name");
    });
});
