import type { AuthController, AuthorizationPolicy } from "@sometic/auth";
import {
    createAuthInterceptor,
    createPolicyInterceptor,
    type AuthInterceptorOptions,
    type PolicyInterceptorOptions,
} from "@sometic/http/auth";
import type { CreateHttpOptions, HttpClient, HttpInterceptor } from "@sometic/http";
import { createHttp } from "@sometic/http";

export type BindAuthToHttpOptions = {
    auth: AuthController;
    http?: HttpClient;
    createHttpOptions?: CreateHttpOptions;
    authInterceptor?: Omit<AuthInterceptorOptions, "auth">;
    policy?: Omit<PolicyInterceptorOptions, "auth">;
    require?: AuthorizationPolicy | readonly AuthorizationPolicy[];
    ownHttp?: boolean;
};

type BindAuthToHttpResult = {
    http: HttpClient;
    owned: boolean;
    dispose: () => void;
};

export function bindAuthToHttp(options: BindAuthToHttpOptions): BindAuthToHttpResult {
    const interceptors: HttpInterceptor[] = [
        createAuthInterceptor({
            auth: options.auth,
            ...options.authInterceptor,
            getEpoch: options.authInterceptor?.getEpoch ?? ((auth) => auth.getEpoch()),
        }),
    ];
    if (options.policy || options.require) {
        interceptors.push(
            createPolicyInterceptor({
                auth: options.auth,
                ...options.policy,
                ...(options.require ? { require: options.require } : {}),
            }),
        );
    }

    if (options.http) {
        const extended = options.http.extend({ interceptors });
        return {
            http: extended,
            owned: true,
            dispose: () => {
                extended.dispose();
            },
        };
    }

    const http = createHttp({
        ...options.createHttpOptions,
        interceptors: [...(options.createHttpOptions?.interceptors ?? []), ...interceptors],
    });
    return {
        http,
        owned: true,
        dispose: () => {
            http.dispose();
        },
    };
}
