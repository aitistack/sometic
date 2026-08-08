import type { AuthCapability } from "./capabilities.js";

export type AuthUser = {
    id: string;
    email?: string;
    displayName?: string;
    roles?: readonly string[];
    permissions?: readonly string[];
    claims?: Readonly<Record<string, unknown>>;
};

export type AuthTokens = {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    tokenType?: string;
    expiresAt?: number;
};

export type AuthSessionStatus =
    | "anonymous"
    | "authenticated"
    | "refreshing"
    | "expired"
    | "invalid"
    | "signedOut"
    | "offline"
    | "reauthenticationRequired"
    | "mfaRequired";

export type AuthSession = {
    status: AuthSessionStatus;
    user: AuthUser | null;
    tokens: AuthTokens | null;
    updatedAt: number;
    epoch: number;
};

export type SignInCredentials = {
    email: string;
    password: string;
};

export type RegisterCredentials = {
    email: string;
    password: string;
    displayName?: string;
};

export type AuthProviderResult = {
    session: AuthSession;
};

export type OAuthStartOptions = {
    provider: string;
    redirectUri: string;
    scopes?: readonly string[];
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: "S256" | "plain";
};

export type OAuthStartResult = {
    authorizationUrl: string;
    state: string;
};

export type OAuthCallbackOptions = {
    provider: string;
    redirectUri: string;
    code: string;
    state?: string;
    codeVerifier?: string;
};

export type MfaChallenge = {
    challengeId: string;
    factor: "totp" | "sms" | "email" | string;
};

export type AuthProvider = {
    readonly id: string;
    readonly capabilities: ReadonlySet<AuthCapability>;
    signIn?(credentials: SignInCredentials): Promise<AuthProviderResult>;
    signOut?(session: AuthSession): Promise<void>;
    register?(credentials: RegisterCredentials): Promise<AuthProviderResult>;
    getSession?(): Promise<AuthSession | null>;
    refresh?(session: AuthSession): Promise<AuthProviderResult>;
    getUser?(session: AuthSession): Promise<AuthUser | null>;
    requestPasswordReset?(email: string): Promise<void>;
    verifyEmail?(token: string): Promise<void>;
    startOAuth?(options: OAuthStartOptions): Promise<OAuthStartResult>;
    completeOAuth?(options: OAuthCallbackOptions): Promise<AuthProviderResult>;
    startMfa?(session: AuthSession): Promise<MfaChallenge>;
    verifyMfa?(challengeId: string, code: string): Promise<AuthProviderResult>;
    revokeSession?(session: AuthSession): Promise<void>;
    revokeAllSessions?(session: AuthSession): Promise<void>;
};
