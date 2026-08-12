import { describe, expect, it, vi } from "vitest";
import { createUploadController, matchesAcceptRule } from "./upload.js";
import { createHttpUploadTransport, resolveUploadFetch } from "./http-transport.js";
import { downloadBlob, downloadFromUrl } from "./download.js";
import type { UploadItem, UploadTransport, UploadTransportContext } from "./types.js";

function createFile(name: string, contents = "hello", type = "text/plain"): File {
    return new File([contents], name, { type });
}

function createDeferredTransport() {
    const calls: { file: File; context: UploadTransportContext }[] = [];
    const settlers: {
        resolve: (result: { url?: string }) => void;
        reject: (error: unknown) => void;
    }[] = [];

    const transport: UploadTransport = {
        upload(file, context) {
            calls.push({ file, context });
            return new Promise((resolve, reject) => {
                settlers.push({ resolve, reject });
            });
        },
    };

    return { transport, calls, settlers };
}

function immediateTransport(url = "https://cdn.example.com/file"): UploadTransport {
    return {
        async upload(_file, context) {
            context.onProgress(0.5);
            await Promise.resolve();
            return { url };
        },
    };
}

async function flush(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}

describe("matchesAcceptRule", () => {
    it("accepts everything when no rules are given", () => {
        expect(matchesAcceptRule(createFile("a.txt"), undefined)).toBe(true);
        expect(matchesAcceptRule(createFile("a.txt"), [])).toBe(true);
        expect(matchesAcceptRule(createFile("a.txt"), ["*/*"])).toBe(true);
    });

    it("matches extensions, wildcards, and exact mime types", () => {
        const png = createFile("photo.PNG", "x", "image/png");
        expect(matchesAcceptRule(png, [".png"])).toBe(true);
        expect(matchesAcceptRule(png, ["image/*"])).toBe(true);
        expect(matchesAcceptRule(png, ["image/png"])).toBe(true);
        expect(matchesAcceptRule(png, ["application/pdf"])).toBe(false);
        expect(matchesAcceptRule(png, [".pdf", "  "])).toBe(false);
    });

    it("does not match wildcards for files without a mime type", () => {
        const unknown = createFile("data.bin", "x", "");
        expect(matchesAcceptRule(unknown, ["image/*"])).toBe(false);
        expect(matchesAcceptRule(unknown, [".bin"])).toBe(true);
    });
});

describe("createUploadController", () => {
    it("queues and uploads a single file", async () => {
        const changes: UploadItem[][] = [];
        const controller = createUploadController({
            transport: immediateTransport(),
            onChange: (items) => changes.push(items),
        });

        const [item] = controller.addFiles([createFile("a.txt")]);
        expect(item?.status).toBe("queued");

        await flush();

        const stored = controller.getItem(item?.id ?? "");
        expect(stored?.status).toBe("success");
        expect(stored?.progress).toBe(1);
        expect(stored?.loadedBytes).toBe(stored?.size);
        expect(stored?.url).toBe("https://cdn.example.com/file");
        expect(stored?.attempts).toBe(1);
        expect(changes.length).toBeGreaterThan(1);
        controller.dispose();
    });

    it("accepts zero byte files", async () => {
        const controller = createUploadController({ transport: immediateTransport() });
        const [item] = controller.addFiles([createFile("empty.txt", "")]);
        expect(item?.size).toBe(0);

        await flush();
        const stored = controller.getItem(item?.id ?? "");
        expect(stored?.status).toBe("success");
        expect(stored?.progress).toBe(1);
        expect(stored?.loadedBytes).toBe(0);
        controller.dispose();
    });

    it("rejects zero byte files when they are not allowed", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            allowEmptyFiles: false,
        });

        const [item] = controller.addFiles([createFile("empty.txt", "")]);
        expect(item?.status).toBe("error");
        expect(item?.error?.message).toContain("empty");
        expect(transport.calls).toHaveLength(0);
        controller.dispose();
    });

    it("rejects oversize files without starting a transfer", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            maxBytes: 4,
        });

        const [item] = controller.addFiles([createFile("big.txt", "0123456789")]);
        expect(item?.status).toBe("error");
        expect(item?.error?.message).toContain("exceeds");
        expect(transport.calls).toHaveLength(0);
        controller.dispose();
    });

    it("rejects files that do not match accept rules", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            accept: ["image/*"],
        });

        const items = controller.addFiles([
            createFile("note.txt"),
            createFile("photo.png", "x", "image/png"),
        ]);

        expect(items[0]?.status).toBe("error");
        expect(items[0]?.error?.message).toContain("accepted types");
        expect(items[1]?.status).toBe("queued");
        expect(transport.calls).toHaveLength(1);
        controller.dispose();
    });

    it("respects the concurrency limit across many files", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            concurrency: 2,
        });

        controller.addFiles([
            createFile("a.txt"),
            createFile("b.txt"),
            createFile("c.txt"),
            createFile("d.txt"),
        ]);

        expect(transport.calls).toHaveLength(2);
        const summary = controller.getSummary();
        expect(summary.total).toBe(4);
        expect(summary.uploading).toBe(2);
        expect(summary.queued).toBe(2);

        transport.settlers[0]?.resolve({});
        controller.dispose();
    });

    it("starts the next queued item when one finishes", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            concurrency: 1,
        });

        controller.addFiles([createFile("a.txt"), createFile("b.txt")]);
        expect(transport.calls).toHaveLength(1);

        transport.settlers[0]?.resolve({ url: "one" });
        await flush();

        expect(transport.calls).toHaveLength(2);
        expect(controller.getItems()[0]?.status).toBe("success");
        expect(controller.getItems()[1]?.status).toBe("uploading");
        controller.dispose();
    });

    it("reports progress updates while uploading", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt", "0123456789")]);

        transport.calls[0]?.context.onProgress(0.5);
        expect(controller.getItem(item?.id ?? "")?.progress).toBe(0.5);
        expect(controller.getItem(item?.id ?? "")?.loadedBytes).toBe(5);

        transport.calls[0]?.context.onProgress(5);
        expect(controller.getItem(item?.id ?? "")?.progress).toBe(1);

        transport.calls[0]?.context.onProgress(Number.NaN);
        expect(controller.getItem(item?.id ?? "")?.progress).toBe(0);

        transport.settlers[0]?.resolve({});
        await flush();
        controller.dispose();
    });

    it("records transport failures and retries them", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt")]);
        const id = item?.id ?? "";

        transport.settlers[0]?.reject(new Error("network down"));
        await flush();

        expect(controller.getItem(id)?.status).toBe("error");
        expect(controller.getItem(id)?.error?.message).toBe("network down");
        expect(controller.getItem(id)?.attempts).toBe(1);

        controller.retry(id);
        expect(controller.getItem(id)?.status).toBe("uploading");
        expect(controller.getItem(id)?.error).toBeNull();

        transport.settlers[1]?.resolve({ url: "ok" });
        await flush();
        expect(controller.getItem(id)?.status).toBe("success");
        expect(controller.getItem(id)?.attempts).toBe(2);
        controller.dispose();
    });

    it("normalizes non error rejections", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt")]);

        transport.settlers[0]?.reject("nope");
        await flush();
        expect(controller.getItem(item?.id ?? "")?.error?.message).toBe("nope");

        controller.dispose();
    });

    it("retries automatically up to maxAttempts", async () => {
        const transport = createDeferredTransport();
        const onItemError = vi.fn();
        const controller = createUploadController({
            transport: transport.transport,
            maxAttempts: 2,
            onItemError,
        });
        const [item] = controller.addFiles([createFile("a.txt")]);

        transport.settlers[0]?.reject(new Error("first"));
        await flush();
        expect(transport.calls).toHaveLength(2);
        expect(onItemError).not.toHaveBeenCalled();

        transport.settlers[1]?.reject(new Error("second"));
        await flush();
        expect(controller.getItem(item?.id ?? "")?.status).toBe("error");
        expect(controller.getItem(item?.id ?? "")?.attempts).toBe(2);
        expect(onItemError).toHaveBeenCalledTimes(1);
        controller.dispose();
    });

    it("aborts the request when an item is canceled", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt")]);
        const id = item?.id ?? "";

        controller.cancel(id);
        expect(transport.calls[0]?.context.signal.aborted).toBe(true);
        expect(controller.getItem(id)?.status).toBe("canceled");

        transport.settlers[0]?.reject(new Error("aborted"));
        await flush();
        expect(controller.getItem(id)?.status).toBe("canceled");

        controller.retry(id);
        expect(controller.getItem(id)?.status).toBe("uploading");
        controller.dispose();
    });

    it("ignores cancel for unknown and finished items", async () => {
        const controller = createUploadController({ transport: immediateTransport() });
        const [item] = controller.addFiles([createFile("a.txt")]);
        await flush();

        controller.cancel("missing");
        controller.cancel(item?.id ?? "");
        expect(controller.getItem(item?.id ?? "")?.status).toBe("success");
        controller.dispose();
    });

    it("pauses and resumes an in-flight item", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt")]);
        const id = item?.id ?? "";

        controller.pause(id);
        expect(controller.getItem(id)?.status).toBe("paused");
        expect(transport.calls[0]?.context.signal.aborted).toBe(true);

        transport.settlers[0]?.reject(new Error("aborted"));
        await flush();
        expect(controller.getItem(id)?.status).toBe("paused");

        controller.resume(id);
        expect(controller.getItem(id)?.status).toBe("uploading");
        expect(transport.calls).toHaveLength(2);

        controller.pause("missing");
        controller.resume("missing");
        transport.settlers[1]?.resolve({});
        await flush();
        expect(controller.getItem(id)?.status).toBe("success");
        controller.dispose();
    });

    it("pauses a queued item before it starts", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            concurrency: 1,
        });

        const items = controller.addFiles([createFile("a.txt"), createFile("b.txt")]);
        controller.pause(items[1]?.id ?? "");
        expect(controller.getItems()[1]?.status).toBe("paused");
        expect(transport.calls).toHaveLength(1);
        controller.dispose();
    });

    it("removes and clears items while aborting their transfers", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            concurrency: 3,
        });

        const items = controller.addFiles([
            createFile("a.txt"),
            createFile("b.txt"),
            createFile("c.txt"),
        ]);

        controller.remove(items[0]?.id ?? "");
        expect(controller.getItems()).toHaveLength(2);
        expect(transport.calls[0]?.context.signal.aborted).toBe(true);
        controller.remove("missing");

        controller.clear();
        expect(controller.getItems()).toEqual([]);
        expect(controller.getSummary()).toMatchObject({ total: 0, progress: 0 });
        expect(transport.calls[1]?.context.signal.aborted).toBe(true);

        transport.settlers[1]?.resolve({});
        await flush();
        expect(controller.getItems()).toEqual([]);
        controller.dispose();
    });

    it("does not start new work when autoStart is off until start is called", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            autoStart: false,
        });

        controller.addFiles([createFile("a.txt")]);
        expect(transport.calls).toHaveLength(0);

        controller.start();
        expect(transport.calls).toHaveLength(1);
        controller.dispose();
    });

    it("notifies subscribers and stops after unsubscribe", () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const listener = vi.fn();
        const unsubscribe = controller.subscribe(listener);

        controller.addFiles([createFile("a.txt")]);
        expect(listener).toHaveBeenCalled();

        const calls = listener.mock.calls.length;
        unsubscribe();
        controller.cancel(controller.getItems()[0]?.id ?? "");
        expect(listener.mock.calls.length).toBe(calls);
        controller.dispose();
    });

    it("aborts everything on dispose mid upload and ignores later work", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({ transport: transport.transport });
        const [item] = controller.addFiles([createFile("a.txt")]);
        const id = item?.id ?? "";

        controller.dispose();
        expect(controller.disposed).toBe(true);
        expect(transport.calls[0]?.context.signal.aborted).toBe(true);
        expect(controller.getItem(id)?.status).toBe("canceled");

        transport.settlers[0]?.resolve({ url: "late" });
        await flush();
        expect(controller.getItem(id)?.status).toBe("canceled");
        expect(controller.getItem(id)?.url).toBeNull();

        expect(controller.addFiles([createFile("b.txt")])).toEqual([]);
        expect(controller.subscribe(vi.fn())).toBeTypeOf("function");
        controller.dispose();
    });

    it("reports an aggregate summary", async () => {
        const transport = createDeferredTransport();
        const controller = createUploadController({
            transport: transport.transport,
            concurrency: 1,
            maxBytes: 4,
        });

        controller.addFiles([createFile("a.txt", "0123456789"), createFile("b.txt", "ab")]);
        transport.calls[0]?.context.onProgress(0.5);

        const summary = controller.getSummary();
        expect(summary).toMatchObject({ total: 2, error: 1, uploading: 1 });
        expect(summary.progress).toBeCloseTo(0.25);

        transport.settlers[0]?.resolve({});
        await flush();
        controller.dispose();
    });

    it("returns an empty list when no files are given", () => {
        const controller = createUploadController({ transport: immediateTransport() });
        expect(controller.addFiles([])).toEqual([]);
        expect(controller.getItem("nope")).toBeUndefined();
        controller.dispose();
    });
});

describe("createHttpUploadTransport", () => {
    it("posts multipart form data and reads the response url", async () => {
        const fetchImpl = vi.fn(
            async (_input: string, _init?: RequestInit): Promise<Response> =>
                new Response(JSON.stringify({ url: "https://cdn.example.com/a.txt" }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                }),
        );

        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl,
            headers: { "x-token": "abc" },
            extraFields: { folder: "invoices" },
            credentials: "include",
        });

        const progress: number[] = [];
        const result = await transport.upload(createFile("a.txt"), {
            signal: new AbortController().signal,
            onProgress: (value) => progress.push(value),
        });

        expect(result).toEqual({ url: "https://cdn.example.com/a.txt" });
        expect(progress).toEqual([0, 1]);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
        const init = fetchImpl.mock.calls[0]?.[1];
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeInstanceOf(FormData);
    });

    it("throws a typed error for non ok responses", async () => {
        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl: async () => new Response("no", { status: 500 }),
        });

        await expect(
            transport.upload(createFile("a.txt"), {
                signal: new AbortController().signal,
                onProgress: () => {},
            }),
        ).rejects.toThrow(/status 500/);
    });

    it("tolerates responses without a json url", async () => {
        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl: async () => new Response("done", { status: 200 }),
        });

        const result = await transport.upload(createFile("a.txt"), {
            signal: new AbortController().signal,
            onProgress: () => {},
        });
        expect(result).toEqual({});
    });

    it("tolerates malformed json bodies", async () => {
        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl: async () =>
                new Response("{oops", {
                    status: 200,
                    headers: { "content-type": "application/json" },
                }),
        });

        const result = await transport.upload(createFile("a.txt"), {
            signal: new AbortController().signal,
            onProgress: () => {},
        });
        expect(result).toEqual({});
    });

    it("supports a custom response parser", async () => {
        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl: async () => new Response("ok", { status: 200 }),
            parseResponse: async (response) => ({ url: await response.text() }),
        });

        const result = await transport.upload(createFile("a.txt"), {
            signal: new AbortController().signal,
            onProgress: () => {},
        });
        expect(result).toEqual({ url: "ok" });
    });

    it("resolves the global fetch lazily", () => {
        expect(resolveUploadFetch()).toBeTypeOf("function");
        const override = async (): Promise<Response> => new Response("x");
        expect(resolveUploadFetch(override)).toBe(override);
    });

    it("drives an upload queue end to end", async () => {
        const transport = createHttpUploadTransport({
            url: "https://api.example.com/upload",
            fetchImpl: async () =>
                new Response(JSON.stringify({ url: "https://cdn.example.com/x" }), {
                    status: 200,
                    headers: { "content-type": "application/json" },
                }),
        });

        const controller = createUploadController({ transport });
        const [item] = controller.addFiles([createFile("a.txt")]);
        await flush();
        await flush();

        expect(controller.getItem(item?.id ?? "")?.url).toBe("https://cdn.example.com/x");
        controller.dispose();
    });
});

describe("download helpers", () => {
    type DownloadStubs = {
        createObjectURL: ReturnType<typeof vi.fn>;
        revokeObjectURL: ReturnType<typeof vi.fn>;
        clicked: string[];
    };

    async function withDownloadStubs(
        run: (stubs: DownloadStubs) => void | Promise<void>,
    ): Promise<void> {
        const createObjectURL = vi.fn(() => "blob:mock");
        const revokeObjectURL = vi.fn();
        const clicked: string[] = [];
        const originalCreate = URL.createObjectURL;
        const originalRevoke = URL.revokeObjectURL;
        const originalClick = HTMLAnchorElement.prototype.click;

        URL.createObjectURL = createObjectURL;
        URL.revokeObjectURL = revokeObjectURL;
        HTMLAnchorElement.prototype.click = function trackClick(this: HTMLAnchorElement) {
            clicked.push(this.download);
        };

        try {
            await run({ createObjectURL, revokeObjectURL, clicked });
        } finally {
            HTMLAnchorElement.prototype.click = originalClick;
            URL.createObjectURL = originalCreate;
            URL.revokeObjectURL = originalRevoke;
        }
    }

    it("fetches a blob and can trigger a browser save", async () => {
        await withDownloadStubs(async (stubs) => {
            const blob = await downloadFromUrl("https://cdn.example.com/a.txt", {
                fetchImpl: async () => new Response("body", { status: 200 }),
                saveAs: "a.txt",
                headers: { "x-token": "abc" },
                signal: new AbortController().signal,
            });

            expect(await blob.text()).toBe("body");
            expect(stubs.createObjectURL).toHaveBeenCalledTimes(1);
            expect(stubs.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
            expect(stubs.clicked).toEqual(["a.txt"]);
            expect(document.querySelectorAll("a")).toHaveLength(0);
        });
    });

    it("returns the blob without saving when saveAs is omitted", async () => {
        await withDownloadStubs(async (stubs) => {
            const blob = await downloadFromUrl("https://cdn.example.com/a.txt", {
                fetchImpl: async () => new Response("body", { status: 200 }),
            });

            expect(await blob.text()).toBe("body");
            expect(stubs.createObjectURL).not.toHaveBeenCalled();
        });
    });

    it("throws a typed error for failed downloads", async () => {
        await expect(
            downloadFromUrl("https://cdn.example.com/a.txt", {
                fetchImpl: async () => new Response("no", { status: 404 }),
            }),
        ).rejects.toThrow(/status 404/);
    });

    it("names the anchor download from the given filename", async () => {
        await withDownloadStubs((stubs) => {
            downloadBlob(new Blob(["x"]), "report.csv");
            expect(stubs.clicked).toEqual(["report.csv"]);
        });
    });
});
