import { assertSafeRequestUrl, type HttpClient } from "@sometic/http";
import type { QueryFunction, QueryFunctionContext } from "../types.js";

export type CreateHttpQueryFnOptions = {
    client: HttpClient;
    path: string | ((context: QueryFunctionContext) => string);
    method?: "get" | "post" | "put" | "patch" | "delete";
    body?: unknown | ((context: QueryFunctionContext) => unknown);
};

export function createHttpQueryFn<TData>(options: CreateHttpQueryFnOptions): QueryFunction<TData> {
    const method = options.method ?? "get";
    return async (context) => {
        const rawPath = typeof options.path === "function" ? options.path(context) : options.path;
        const path = assertSafeRequestUrl(rawPath);
        const body = typeof options.body === "function" ? options.body(context) : options.body;
        if (method === "get") {
            const response = await options.client.get<TData>(path, { signal: context.signal });
            return response.data;
        }
        if (method === "post") {
            const response = await options.client.post<TData>(path, body, {
                signal: context.signal,
            });
            return response.data;
        }
        if (method === "put") {
            const response = await options.client.put<TData>(path, body, {
                signal: context.signal,
            });
            return response.data;
        }
        if (method === "patch") {
            const response = await options.client.patch<TData>(path, body, {
                signal: context.signal,
            });
            return response.data;
        }
        const response = await options.client.delete<TData>(path, { signal: context.signal });
        return response.data;
    };
}
