import { describe, expect, it } from "vitest";
import { fromSchema } from "../schema/index.js";
import {
    array,
    boolean,
    defineSchema,
    number,
    object,
    optional,
    refine,
    string,
    union,
} from "./index.js";
import { runValidators } from "../validators/index.js";

describe("define schema", () => {
    it("parses nested objects and arrays", () => {
        const schema = object({
            email: string({ email: true, nonempty: true }),
            tags: array(string({ min: 1 })),
            age: optional(number({ min: 0, int: true })),
        });
        const result = schema.safeParse({
            email: "a@b.co",
            tags: ["x", "y"],
            age: "21",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.age).toBe(21);
        }
    });

    it("returns path-aware issues", () => {
        const schema = object({
            profile: object({
                name: string({ min: 2 }),
            }),
        });
        const result = schema.safeParse({ profile: { name: "a" } });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues[0]?.path).toBe("profile.name");
        }
    });

    it("supports refine and union", () => {
        const password = refine(
            object({
                password: string({ min: 6 }),
                confirm: string({ min: 6 }),
            }),
            (value) => value.password === value.confirm,
            "Passwords must match",
            "password-mismatch",
        );
        expect(password.safeParse({ password: "abcdef", confirm: "abcdef" }).success).toBe(true);
        expect(password.safeParse({ password: "abcdef", confirm: "xxxxxx" }).success).toBe(false);
        const id = union([string(), number()]);
        expect(id.safeParse("a").success).toBe(true);
        expect(id.safeParse(1).success).toBe(true);
        expect(boolean().safeParse(true).success).toBe(true);
    });

    it("defineSchema + fromSchema wires into validators", async () => {
        const adapter = defineSchema(
            object({
                email: string({ email: true }),
            }),
        );
        const result = await runValidators(
            [fromSchema(adapter)],
            { email: "bad" },
            {
                values: {},
                path: "",
            },
        );
        expect(result.valid).toBe(false);
        expect(result.issues[0]?.path).toBe("email");
    });
});
