import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import { createHttp, type CreateHttpOptions, type HttpClient } from "@sometic/http";

const HttpContext = createContext<HttpClient | null>(null);

export type HttpProviderProps = {
    client?: HttpClient;
    options?: CreateHttpOptions;
    children: ReactNode;
};

export function HttpProvider(props: HttpProviderProps): ReactNode {
    const client = useMemo(() => {
        if (props.client) {
            return props.client;
        }
        if (!props.options) {
            throw new Error("HttpProvider requires client or options");
        }
        return createHttp(props.options);
    }, [props.client, props.options]);
    return createElement(HttpContext.Provider, { value: client }, props.children);
}

export function useHttp(): HttpClient {
    const client = useContext(HttpContext);
    if (!client) {
        throw new Error("useHttp requires HttpProvider");
    }
    return client;
}
