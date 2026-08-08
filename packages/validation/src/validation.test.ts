import { describe, expect, it } from "vitest";
import { getAt, joinPath, parsePath, setAt, deleteAt } from "./path/index.js";
import { email, minLength, normalizeResult, required, runValidators } from "./validators/index.js";
import { all, pipe, refine, when } from "./compose/index.js";
import { createIssue, ok } from "./issues.js";
import { debouncePromise } from "./index.js";

describe("path", () => {
    it("parses and joins nested and array paths", () => {
        expect(parsePath("user.email")).toEqual(["user", "email"]);
        expect(parsePath("items[0].qty")).toEqual(["items", 0, "qty"]);
        expect(joinPath(["items", 0, "qty"])).toBe("items[0].qty");
    });

    it("gets sets and deletes immutable-style", () => {
        const source = { user: { email: "a@b.c" }, items: [{ qty: 1 }, { qty: 2 }] };
        expect(getAt(source, "user.email")).toBe("a@b.c");
        expect(getAt(source, "items[1].qty")).toBe(2);
        const next = setAt(source, "items[0].qty", 9);
        expect(next.items[0]?.qty).toBe(9);
        expect(source.items[0]?.qty).toBe(1);
        const removed = deleteAt(next, "items[0]");
        expect(removed.items).toHaveLength(1);
        expect(removed.items[0]?.qty).toBe(2);
    });
});

describe("validators", () => {
    it("validates required email and length", async () => {
        const context = { values: {}, path: "email" };
        expect((await runValidators([required()], "", context)).valid).toBe(false);
        expect((await runValidators([email()], "not-an-email", context)).valid).toBe(false);
        expect((await runValidators([email(), minLength(3)], "a@b.c", context)).valid).toBe(true);
    });
});

describe("compose", () => {
    it("pipes and refines with when", async () => {
        const context = { values: { confirm: "x" }, path: "password" };
        const result = normalizeResult(
            await pipe(
                required(),
                minLength(4),
                refine((value) => value === "secret", "Must match"),
            )("nope", context),
            context.path,
        );
        expect(result.valid).toBe(false);

        const skipped = await when(() => false, required())("", context);
        expect(skipped).toEqual(ok());

        const both = normalizeResult(
            await all(required(), minLength(2))("ab", context),
            context.path,
        );
        expect(both.valid).toBe(true);
    });
});

describe("debouncePromise", () => {
    it("resolves after delay and aborts", async () => {
        const value = await debouncePromise(async () => 1, 10);
        expect(value).toBe(1);
        const controller = new AbortController();
        const pending = debouncePromise(async () => 2, 50, controller.signal);
        controller.abort();
        await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    });
});

describe("issues", () => {
    it("creates issues", () => {
        expect(createIssue("required", "Required", { path: "a" }).path).toBe("a");
    });
});
