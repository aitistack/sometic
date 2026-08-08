import { describe, expect, it } from "vitest";
import { fromSchema } from "@sometic/validation/schema";
import { runValidators } from "@sometic/validation/validators";
import { z } from "zod";
import { createZodSchemaAdapter, issuesFromZodError } from "./index.js";

describe("createZodSchemaAdapter", () => {
    it("maps zod issues to Sometic paths", () => {
        const adapter = createZodSchemaAdapter(
            z.object({
                user: z.object({
                    email: z.string().email(),
                }),
            }),
        );
        const result = adapter.safeParse({ user: { email: "nope" } });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues[0]?.path).toBe("user.email");
        }
    });

    it("works with fromSchema validators", async () => {
        const adapter = createZodSchemaAdapter(z.string().min(3));
        const outcome = await runValidators([fromSchema(adapter)], "ab", {
            values: {},
            path: "name",
        });
        expect(outcome.valid).toBe(false);
        expect(outcome.issues[0]?.path).toBe("name");
    });

    it("issuesFromZodError handles empty path", () => {
        const issues = issuesFromZodError({
            issues: [{ message: "bad", path: [], code: "custom" }],
        });
        expect(issues[0]?.path).toBeUndefined();
        expect(issues[0]?.code).toBe("custom");
    });
});
