import { onScopeDispose } from "vue";
import { createHttp, type CreateHttpOptions, type HttpClient } from "@sometic/http";

export function useHttp(options: CreateHttpOptions | HttpClient): {
    http: HttpClient;
} {
    const http = "request" in options ? options : createHttp(options);
    onScopeDispose(() => {
        if (!("request" in options)) {
            http.dispose();
        }
    });
    return { http };
}
