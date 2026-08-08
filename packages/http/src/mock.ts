export type MockFetcherHandler = {
    method?: string;
    url: string | RegExp;
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
    delayMs?: number;
    times?: number;
};

export function createMockFetcher(handlers: MockFetcherHandler[]): typeof fetch {
    const remaining = handlers.map((handler) => ({
        ...handler,
        left: handler.times ?? Number.POSITIVE_INFINITY,
    }));
    const calls: Array<{ method: string; url: string }> = [];

    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
            typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const method = (init?.method ?? "GET").toUpperCase();
        calls.push({ method, url });
        const match = remaining.find((handler) => {
            if (handler.left <= 0) {
                return false;
            }
            if (handler.method && handler.method.toUpperCase() !== method) {
                return false;
            }
            if (typeof handler.url === "string") {
                return url.includes(handler.url) || url === handler.url;
            }
            return handler.url.test(url);
        });
        if (!match) {
            return new Response(JSON.stringify({ error: "unhandled" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        match.left -= 1;
        if (match.delayMs) {
            await new Promise((resolve) => {
                setTimeout(resolve, match.delayMs);
            });
        }
        const headers = new Headers(match.headers);
        let body: BodyInit | null = null;
        if (match.body !== undefined && match.body !== null) {
            if (
                typeof match.body === "string" ||
                match.body instanceof Blob ||
                match.body instanceof ArrayBuffer
            ) {
                body = match.body as BodyInit;
            } else {
                if (!headers.has("Content-Type")) {
                    headers.set("Content-Type", "application/json");
                }
                body = JSON.stringify(match.body);
            }
        }
        return new Response(body, {
            status: match.status ?? 200,
            headers,
        });
    }) as typeof fetch & { calls: typeof calls };

    Object.defineProperty(fetcher, "calls", {
        get: () => calls,
    });
    return fetcher;
}
