import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
} from "@sometic/auth";
import { createAuthInterceptor } from "@sometic/http/auth";
import { createHttp, createMockFetcher } from "@sometic/http";

export function mountHttpSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-http-status]");
    const log = root.querySelector<HTMLElement>("[data-http-log]");
    if (!status || !log) {
        throw new Error("HTTP section nodes missing");
    }

    const provider = createTestAuthProvider();
    const auth = createAuth({
        provider,
        storage: createMemoryAuthStorage(),
        crossTab: createNoopAuthBus(),
        environment: false,
    });

    let forceUnauthorized = true;
    const fetcher = createMockFetcher([]);
    const liveFetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
            typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes("/ok")) {
            return new Response(JSON.stringify({ message: "hello" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (url.includes("/secure")) {
            if (forceUnauthorized) {
                forceUnauthorized = false;
                return new Response(null, { status: 401 });
            }
            return new Response(JSON.stringify({ secured: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (url.includes("/flaky")) {
            return new Response(null, { status: 503 });
        }
        return fetcher(input, init);
    }) as typeof fetch;

    const http = createHttp({
        baseUrl: "https://demo.example.local",
        fetcher: liveFetcher,
        interceptors: [createAuthInterceptor({ auth })],
        retry: { retries: 2, minDelayMs: 10, maxDelayMs: 50 },
    });

    const write = (message: string): void => {
        log.textContent = `${message}\n${log.textContent ?? ""}`.trim();
        status.textContent = message;
    };

    root.querySelector("[data-http-get]")?.addEventListener("click", () => {
        void http
            .get<{ message: string }>("/ok")
            .then((response) => {
                write(`GET /ok → ${response.status} ${response.data.message}`);
            })
            .catch((error: Error) => {
                write(`GET /ok failed: ${error.message}`);
            });
    });

    root.querySelector("[data-http-auth]")?.addEventListener("click", () => {
        forceUnauthorized = true;
        void auth
            .signIn({ email: "demo@example.com", password: "password" })
            .then(() => http.get<{ secured: boolean }>("/secure"))
            .then((response) => {
                write(`GET /secure after 401→refresh → ${String(response.data.secured)}`);
            })
            .catch((error: Error) => {
                write(`Auth queue failed: ${error.message}`);
            });
    });

    root.querySelector("[data-http-abort]")?.addEventListener("click", () => {
        const controller = new AbortController();
        const pending = http.get("/ok", { signal: controller.signal, timeoutMs: 5_000 });
        controller.abort();
        void pending
            .then(() => {
                write("Abort unexpectedly succeeded");
            })
            .catch((error: { code?: string; message: string }) => {
                write(`Aborted → ${error.code ?? error.message}`);
            });
    });

    write("HTTP ready (mock fetch · test auth)");

    return () => {
        http.dispose();
        auth.dispose();
    };
}
