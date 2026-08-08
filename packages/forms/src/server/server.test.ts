import { describe, expect, it } from "vitest";
import { mapServerErrorBody } from "./index.js";

describe("mapServerErrorBody", () => {
    it("maps errors array with path or field", () => {
        expect(
            mapServerErrorBody({
                errors: [
                    { path: "email", code: "unique", message: "Taken" },
                    { field: "name", message: "Required" },
                ],
            }),
        ).toEqual([
            { code: "unique", message: "Taken", path: "email" },
            { code: "server", message: "Required", path: "name" },
        ]);
    });

    it("maps fieldErrors records", () => {
        expect(
            mapServerErrorBody({
                fieldErrors: {
                    password: "Too short",
                    tags: ["Required", "Invalid"],
                },
            }),
        ).toEqual([
            { code: "server", message: "Too short", path: "password" },
            { code: "server", message: "Required", path: "tags" },
            { code: "server", message: "Invalid", path: "tags" },
        ]);
    });

    it("maps Problem Details style payloads", () => {
        expect(
            mapServerErrorBody({
                title: "Validation failed",
                detail: "One or more fields are invalid",
                invalid_params: [{ name: "age", reason: "must be >= 18", path: "age" }],
            }),
        ).toEqual([
            {
                code: "server",
                message: "must be >= 18",
                path: "age",
            },
        ]);

        expect(
            mapServerErrorBody({
                title: "Unauthorized",
                detail: "Missing token",
            }),
        ).toEqual([{ code: "server", message: "Missing token" }]);
    });
});
