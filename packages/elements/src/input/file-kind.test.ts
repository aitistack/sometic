import { describe, expect, it } from "vitest";
import { fileKindSvg, formatAcceptHint, resolveFileKind } from "./file-kind.js";

describe("file-kind", () => {
    it("maps major mime and extensions", () => {
        expect(resolveFileKind(new File([], "shot.png", { type: "image/png" }))).toBe("image");
        expect(resolveFileKind(new File([], "clip.mp4", { type: "video/mp4" }))).toBe("video");
        expect(resolveFileKind(new File([], "track.mp3", { type: "audio/mpeg" }))).toBe("audio");
        expect(resolveFileKind(new File([], "spec.pdf", { type: "application/pdf" }))).toBe("pdf");
        expect(resolveFileKind(new File([], "notes.txt", { type: "text/plain" }))).toBe("text");
        expect(resolveFileKind(new File([], "sheet.csv", { type: "text/csv" }))).toBe(
            "spreadsheet",
        );
        expect(resolveFileKind(new File([], "bundle.zip", { type: "application/zip" }))).toBe(
            "archive",
        );
        expect(resolveFileKind(new File([], "app.ts", { type: "" }))).toBe("code");
        expect(resolveFileKind(new File([], "mystery.bin", { type: "" }))).toBe("file");
        expect(resolveFileKind(undefined)).toBe("file");
    });

    it("returns svg markup per kind", () => {
        expect(fileKindSvg("image")).toContain("<svg");
        expect(fileKindSvg("file")).toContain("<svg");
    });

    it("formats accept hints", () => {
        expect(formatAcceptHint(".png,image/*,application/pdf")).toContain("PNG");
        expect(formatAcceptHint("")).toBe("Any common file type");
    });
});
