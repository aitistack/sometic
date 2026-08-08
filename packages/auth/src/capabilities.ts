export const AUTH_CAPABILITIES = [
    "signIn",
    "signOut",
    "register",
    "getSession",
    "refresh",
    "getUser",
    "passwordReset",
    "emailVerification",
    "oauth",
    "mfa",
    "accountLinking",
    "revokeSession",
    "guestSession",
] as const;

export type AuthCapability = (typeof AUTH_CAPABILITIES)[number];

export function hasCapability(
    capabilities: ReadonlySet<AuthCapability> | readonly AuthCapability[],
    capability: AuthCapability,
): boolean {
    if (capabilities instanceof Set) {
        return capabilities.has(capability);
    }
    return (capabilities as readonly AuthCapability[]).includes(capability);
}
