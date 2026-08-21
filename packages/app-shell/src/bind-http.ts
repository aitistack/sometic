import type { AuthController, AuthorizationPolicy } from "@sometic/auth";
import {
    createAuthInterceptor,
    createPolicyInterceptor,
    isAuthHttpInterceptor,
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
    const needsPolicy = Boolean(options.policy || options.require);
    const authInterceptor = createAuthInterceptor({
        auth: options.auth,
        ...options.authInterceptor,
        getEpoch: options.authInterceptor?.getEpoch ?? ((auth) => auth.getEpoch()),
    });
    const policyInterceptor = needsPolicy
        ? createPolicyInterceptor({
              auth: options.auth,
              ...options.policy,
              ...(options.require ? { require: options.require } : {}),
          })
        : null;

    if (options.http) {
        const existing = options.http.getInterceptors();
        const hasAuth = existing.some(isAuthHttpInterceptor);
        const toAdd: HttpInterceptor[] = [];
        if (!hasAuth) {
            toAdd.push(authInterceptor);
        }
        if (policyInterceptor) {
            toAdd.push(policyInterceptor);
        }
        if (toAdd.length === 0) {
            return {
                http: options.http,
                owned: false,
                dispose: () => {},
            };
        }
        const extended = options.http.extend({ interceptors: toAdd });
        return {
            http: extended,
            owned: true,
            dispose: () => {
                extended.dispose();
            },
        };
    }

    const interceptors: HttpInterceptor[] = [authInterceptor];
    if (policyInterceptor) {
        interceptors.push(policyInterceptor);
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
