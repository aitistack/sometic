import type { AuthController, AuthorizationPolicy } from "@sometic/auth";
import { createHttpError } from "../errors.js";
import type { HttpInterceptor, HttpRequestConfig } from "../types.js";

export type PolicyInterceptorOptions = {
    auth: AuthController;
    require?: AuthorizationPolicy | readonly AuthorizationPolicy[];
    requireFor?: (
        config: HttpRequestConfig,
    ) => AuthorizationPolicy | AuthorizationPolicy[] | null | undefined;
    attachTenantHeader?:
        string | ((auth: AuthController) => Record<string, string> | null | undefined);
    tenantClaim?: string;
};

function normalizePolicies(
    value: AuthorizationPolicy | readonly AuthorizationPolicy[] | null | undefined,
): AuthorizationPolicy[] {
    if (!value) {
        return [];
    }
    if (typeof value === "function") {
        return [value];
    }
    return [...value];
}

export function createPolicyInterceptor(options: PolicyInterceptorOptions): HttpInterceptor {
    const tenantClaim = options.tenantClaim ?? "tenantId";

    return {
        onRequest: (config) => {
            const policies = [
                ...normalizePolicies(options.require),
                ...normalizePolicies(options.requireFor?.(config)),
            ];

            for (const policy of policies) {
                if (!options.auth.authorize(policy)) {
                    throw createHttpError(
                        "HTTP_POLICY_DENIED",
                        "Request blocked by authorization policy",
                    );
                }
            }

            const headers = { ...config.headers };
            if (typeof options.attachTenantHeader === "function") {
                const extra = options.attachTenantHeader(options.auth);
                if (extra) {
                    Object.assign(headers, extra);
                }
            } else if (typeof options.attachTenantHeader === "string") {
                const claim = options.auth.getUser()?.claims?.[tenantClaim];
                if (typeof claim === "string" || typeof claim === "number") {
                    headers[options.attachTenantHeader] = String(claim);
                }
            }

            return {
                ...config,
                headers,
            };
        },
    };
}
