import { describe, expect, it, vi } from "vitest";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
    requirePermission,
} from "@sometic/auth";
import { createAuthInterceptor } from "./auth/index.js";
import { createPolicyInterceptor } from "./auth/policy.js";
import { createHttp } from "./create-http.js";
import { createMockFetcher } from "./mock.js";

describe("http client", () => {
    it("joins baseUrl and parses json", async () => {
        const fetcher = createMockFetcher([
            { url: "https://api.test/v1/hello", body: { ok: true } },
        ]);
        const http = createHttp({ baseUrl: "https://api.test/v1", fetcher });
        const response = await http.get<{ ok: boolean }>("/hello");
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ ok: true });
        http.dispose();
    });

    it("dedupes concurrent GET requests", async () => {
        let hits = 0;
        const fetcher = vi.fn(async () => {
            hits += 1;
            await new Promise((resolve) => setTimeout(resolve, 20));
            return new Response(JSON.stringify({ hits }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }) as unknown as typeof fetch;
        const http = createHttp({ fetcher, dedupe: { enabled: true } });
        const [a, b] = await Promise.all([http.get("/x"), http.get("/x")]);
        expect(hits).toBe(1);
        expect(a.data).toEqual(b.data);
        http.dispose();
    });

    it("retries transient failures", async () => {
        let hits = 0;
        const fetcher = vi.fn(async () => {
            hits += 1;
            if (hits < 3) {
                return new Response(null, { status: 503 });
            }
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }) as unknown as typeof fetch;
        const http = createHttp({
            fetcher,
            retry: { retries: 3, minDelayMs: 1, maxDelayMs: 5 },
        });
        const response = await http.get<{ ok: boolean }>("/retry");
        expect(response.data.ok).toBe(true);
        expect(hits).toBe(3);
        http.dispose();
    });

    it("queues unauthorized requests through auth refresh", async () => {
        const provider = createTestAuthProvider({ accessTokenTtlMs: 60_000 });
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        let hits = 0;
        const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
            hits += 1;
            const header = new Headers(init?.headers).get("Authorization") ?? "";
            if (hits === 1) {
                return new Response(null, { status: 401 });
            }
            expect(header.startsWith("Bearer ")).toBe(true);
            return new Response(JSON.stringify({ secured: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }) as unknown as typeof fetch;

        const http = createHttp({
            fetcher,
            interceptors: [createAuthInterceptor({ auth })],
            retry: false,
        });
        const response = await http.get<{ secured: boolean }>("/secure");
        expect(response.data.secured).toBe(true);
        expect(hits).toBe(2);
        auth.dispose();
        http.dispose();
    });

    it("aborts via signal", async () => {
        const controller = new AbortController();
        let started!: () => void;
        const whenStarted = new Promise<void>((resolve) => {
            started = resolve;
        });
        const fetcher = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
            started();
            await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(resolve, 500);
                init?.signal?.addEventListener(
                    "abort",
                    () => {
                        clearTimeout(timer);
                        reject(new DOMException("Aborted", "AbortError"));
                    },
                    { once: true },
                );
                if (init?.signal?.aborted) {
                    clearTimeout(timer);
                    reject(new DOMException("Aborted", "AbortError"));
                }
            });
            return new Response("{}");
        }) as unknown as typeof fetch;
        const http = createHttp({ fetcher, retry: false });
        const pending = http.get("/slow", { signal: controller.signal });
        await whenStarted;
        controller.abort();
        await expect(pending).rejects.toMatchObject({ code: "HTTP_ABORTED" });
        http.dispose();
    });

    it("rejects unsafe absolute URL schemes", async () => {
        const fetcher = vi.fn();
        const http = createHttp({ baseUrl: "https://api.test", fetcher: fetcher as never });
        await expect(http.get("javascript:alert(1)")).rejects.toMatchObject({
            code: "HTTP_INVALID_URL",
        });
        await expect(http.get("data:text/plain,hi")).rejects.toMatchObject({
            code: "HTTP_INVALID_URL",
        });
        expect(fetcher).not.toHaveBeenCalled();
        http.dispose();
    });

    it("rejects http(s) absolute URLs unless allowAbsoluteUrl is true", async () => {
        const fetcher = vi.fn();
        const http = createHttp({ fetcher: fetcher as never });
        await expect(http.get("https://evil.example/x")).rejects.toMatchObject({
            code: "HTTP_INVALID_URL",
        });
        const allowed = createHttp({
            fetcher: createMockFetcher([{ url: "https://ok.example/x", body: { ok: true } }]),
            allowAbsoluteUrl: true,
        });
        const response = await allowed.get<{ ok: boolean }>("https://ok.example/x");
        expect(response.data.ok).toBe(true);
        http.dispose();
        allowed.dispose();
    });

    it("enforces maxResponseBytes", async () => {
        const http = createHttp({
            maxResponseBytes: 8,
            fetcher: createMockFetcher([
                {
                    url: "/big",
                    body: { message: "this-is-too-large" },
                },
            ]),
        });
        await expect(http.get("/big")).rejects.toMatchObject({
            code: "HTTP_RESPONSE_TOO_LARGE",
        });
        http.dispose();
    });

    it("blocks requests that fail authorization policy", async () => {
        const provider = createTestAuthProvider();
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const http = createHttp({
            fetcher: createMockFetcher([{ url: "/admin", body: { ok: true } }]),
            interceptors: [
                createPolicyInterceptor({
                    auth,
                    require: requirePermission("admin"),
                }),
            ],
        });
        await expect(http.get("/admin")).rejects.toMatchObject({
            code: "HTTP_POLICY_DENIED",
        });
        http.dispose();
        auth.dispose();
    });
});
