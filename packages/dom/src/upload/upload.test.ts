import { describe, expect, it, vi } from "vitest";
import {
    createUploadDropzoneController,
    resolveUploadDropzone,
    resolveUploadItem,
    resolveUploadList,
} from "./index.js";

function createFile(name: string, contents = "data"): File {
    return new File([contents], name, { type: "text/plain" });
}

describe("resolveUploadDropzone", () => {
    it("resolves idle, dragging, and disabled states", () => {
        expect(resolveUploadDropzone().attributes["data-state"]).toBe("idle");
        const dragging = resolveUploadDropzone({ dragging: true });
        expect(dragging.attributes["data-dragging"]).toBe("true");
        expect(dragging.attributes["data-state"]).toBe("dragging");
        const disabled = resolveUploadDropzone({ disabled: true, dragging: true });
        expect(disabled.attributes["data-state"]).toBe("disabled");
        expect(disabled.attributes.tabindex).toBe("-1");
        expect(disabled.attributes["aria-disabled"]).toBe("true");
    });

    it("exposes accept and label metadata", () => {
        const view = resolveUploadDropzone({
            accept: "image/*",
            multiple: false,
            label: "Drop avatars",
        });
        expect(view.attributes["data-accept"]).toBe("image/*");
        expect(view.attributes["data-multiple"]).toBe("false");
        expect(view.attributes["aria-label"]).toBe("Drop avatars");
    });
});

describe("resolveUploadList", () => {
    it("marks the empty state", () => {
        const empty = resolveUploadList();
        expect(empty.empty).toBe(true);
        expect(empty.attributes["data-empty"]).toBe("true");
        expect(empty.attributes["aria-live"]).toBe("polite");
        const filled = resolveUploadList({ count: 3, live: "off" });
        expect(filled.attributes["data-count"]).toBe("3");
        expect(filled.attributes["aria-live"]).toBeUndefined();
    });
});

describe("resolveUploadItem", () => {
    it("resolves progress bar semantics", () => {
        const view = resolveUploadItem({
            id: "a",
            status: "uploading",
            progress: 0.5,
            name: "a.txt",
        });
        expect(view.percent).toBe(50);
        expect(view.progressAttributes["aria-valuenow"]).toBe("50");
        expect(view.progressAttributes["aria-label"]).toBe("a.txt");
        expect(view.attributes["aria-busy"]).toBe("true");
    });

    it("clamps progress and flags errors", () => {
        expect(resolveUploadItem({ id: "a", status: "success", progress: 5 }).percent).toBe(100);
        expect(resolveUploadItem({ id: "a", status: "queued", progress: -1 }).percent).toBe(0);
        const failed = resolveUploadItem({ id: "a", status: "error" });
        expect(failed.attributes["data-invalid"]).toBe("");
        expect(failed.attributes["aria-busy"]).toBeUndefined();
    });
});

describe("createUploadDropzoneController", () => {
    it("tracks nested drag enter and leave", () => {
        const onFiles = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles });
        dropzone.handleDragEnter({});
        dropzone.handleDragEnter({});
        expect(dropzone.isDragging()).toBe(true);
        dropzone.handleDragLeave({});
        expect(dropzone.isDragging()).toBe(true);
        dropzone.handleDragLeave({});
        expect(dropzone.isDragging()).toBe(false);
        dropzone.dispose();
    });

    it("emits dropped files and resets dragging", () => {
        const onFiles = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles });
        const preventDefault = vi.fn();
        dropzone.handleDragEnter({});
        const files = dropzone.handleDrop({
            preventDefault,
            dataTransfer: { files: [createFile("one.txt"), createFile("two.txt")] },
        });
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(files).toHaveLength(2);
        expect(onFiles).toHaveBeenCalledTimes(1);
        expect(dropzone.isDragging()).toBe(false);
        expect(dropzone.input.value.get()).toHaveLength(2);
        dropzone.dispose();
    });

    it("keeps a single file when multiple is disabled", () => {
        const onFiles = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles, multiple: false });
        const files = dropzone.handleFileList([createFile("one.txt"), createFile("two.txt")]);
        expect(files).toHaveLength(1);
        dropzone.dispose();
    });

    it("reads drag items when files are absent", () => {
        const onFiles = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles });
        const file = createFile("from-item.txt");
        const files = dropzone.handleDrop({
            dataTransfer: {
                files: [],
                items: [
                    { kind: "string", getAsFile: () => null },
                    { kind: "file", getAsFile: () => file },
                ],
            },
        });
        expect(files).toEqual([file]);
        dropzone.dispose();
    });

    it("ignores drops, keys, and open while disabled", () => {
        const onFiles = vi.fn();
        const openFilePicker = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles, openFilePicker });
        dropzone.setDisabled(true);
        expect(dropzone.handleDrop({ dataTransfer: { files: [createFile("x.txt")] } })).toEqual([]);
        expect(dropzone.handleKeyDown({ key: "Enter" })).toBe(false);
        dropzone.open();
        expect(onFiles).not.toHaveBeenCalled();
        expect(openFilePicker).not.toHaveBeenCalled();
        expect(dropzone.isDisabled()).toBe(true);
        dropzone.dispose();
    });

    it("opens the picker on Enter and Space only", () => {
        const openFilePicker = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles: () => {}, openFilePicker });
        expect(dropzone.handleKeyDown({ key: "Enter" })).toBe(true);
        expect(dropzone.handleKeyDown({ key: " " })).toBe(true);
        expect(dropzone.handleKeyDown({ key: "a" })).toBe(false);
        expect(openFilePicker).toHaveBeenCalledTimes(2);
        dropzone.dispose();
    });

    it("stops emitting after dispose", () => {
        const onFiles = vi.fn();
        const dropzone = createUploadDropzoneController({ onFiles });
        dropzone.dispose();
        expect(dropzone.handleFileList([createFile("x.txt")])).toEqual([]);
        expect(onFiles).not.toHaveBeenCalled();
    });

    it("resolves its own view model", () => {
        const dropzone = createUploadDropzoneController({
            onFiles: () => {},
            accept: ".png",
        });
        dropzone.handleDragEnter({});
        const view = dropzone.resolve();
        expect(view.dragging).toBe(true);
        expect(view.attributes["data-accept"]).toBe(".png");
        dropzone.dispose();
    });
});
