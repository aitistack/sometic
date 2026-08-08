export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type HttpResponseType = "json" | "text" | "blob" | "arrayBuffer" | "raw";

export type HttpRequestConfig = {
    method?: HttpMethod | string;
    url: string;
    headers?: Record<string, string>;
    body?: BodyInit | null;
    signal?: AbortSignal | null;
    timeoutMs?: number;
    responseType?: HttpResponseType;
    retry?: boolean | number;
    dedupe?: boolean;
    authReplay?: boolean;
    meta?: Record<string, unknown>;
};

export type HttpResponse<T = unknown> = {
    data: T;
    status: number;
    headers: Headers;
    url: string;
    raw: Response;
};

export type HttpInterceptor = {
    onRequest?: (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
    onResponse?: <T>(
        response: HttpResponse<T>,
        config: HttpRequestConfig,
    ) => HttpResponse<T> | Promise<HttpResponse<T>>;
    onError?: (error: unknown, config: HttpRequestConfig) => unknown | Promise<unknown>;
};

export type RetryOptions = {
    retries?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
    factor?: number;
    retryOn?: (context: {
        attempt: number;
        error: unknown;
        config: HttpRequestConfig;
        response?: Response;
    }) => boolean;
    methods?: readonly string[];
};

export type DedupeOptions = {
    enabled?: boolean;
    methods?: readonly string[];
    includeAuthorization?: boolean;
};

export type CreateHttpOptions = {
    baseUrl?: string;
    headers?: Record<string, string>;
    fetcher?: typeof fetch;
    timeoutMs?: number;
    interceptors?: HttpInterceptor[];
    retry?: RetryOptions | false;
    dedupe?: DedupeOptions | false;
    now?: () => number;
    allowAbsoluteUrl?: boolean;
    maxResponseBytes?: number;
};

export type HttpClient = {
    request: <T = unknown>(config: HttpRequestConfig) => Promise<HttpResponse<T>>;
    get: <T = unknown>(
        url: string,
        init?: Omit<HttpRequestConfig, "url" | "method" | "body">,
    ) => Promise<HttpResponse<T>>;
    post: <T = unknown>(
        url: string,
        body?: BodyInit | null,
        init?: Omit<HttpRequestConfig, "url" | "method" | "body">,
    ) => Promise<HttpResponse<T>>;
    put: <T = unknown>(
        url: string,
        body?: BodyInit | null,
        init?: Omit<HttpRequestConfig, "url" | "method" | "body">,
    ) => Promise<HttpResponse<T>>;
    patch: <T = unknown>(
        url: string,
        body?: BodyInit | null,
        init?: Omit<HttpRequestConfig, "url" | "method" | "body">,
    ) => Promise<HttpResponse<T>>;
    delete: <T = unknown>(
        url: string,
        init?: Omit<HttpRequestConfig, "url" | "method" | "body">,
    ) => Promise<HttpResponse<T>>;
    extend: (overrides: CreateHttpOptions) => HttpClient;
    dispose: () => void;
};
