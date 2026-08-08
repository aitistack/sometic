import {
    createAuthError,
    createSession,
    type AuthCapability,
    type AuthProvider,
    type AuthProviderResult,
    type AuthSession,
    type AuthUser,
} from "@sometic/auth";

export type FirebaseUserLike = {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

export type FirebaseAuthLike = {
    currentUser: FirebaseUserLike | null;
    signInWithEmailAndPassword: (
        email: string,
        password: string,
    ) => Promise<{ user: FirebaseUserLike }>;
    createUserWithEmailAndPassword: (
        email: string,
        password: string,
    ) => Promise<{ user: FirebaseUserLike }>;
    signOut: () => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    sendEmailVerification?: (user: FirebaseUserLike) => Promise<void>;
};

export type FirebaseAuthProviderOptions = {
    auth: FirebaseAuthLike;
    mapUser?: (user: FirebaseUserLike) => AuthUser;
};

async function toResult(
    user: FirebaseUserLike,
    mapUser: (user: FirebaseUserLike) => AuthUser,
    forceRefresh = false,
): Promise<AuthProviderResult> {
    const accessToken = await user.getIdToken(forceRefresh);
    return {
        session: createSession({
            status: "authenticated",
            user: mapUser(user),
            tokens: {
                accessToken,
                tokenType: "Bearer",
            },
        }),
    };
}

function defaultMapUser(user: FirebaseUserLike): AuthUser {
    return {
        id: user.uid,
        ...(user.email ? { email: user.email } : {}),
        ...(user.displayName ? { displayName: user.displayName } : {}),
    };
}

export function createFirebaseAuthProvider(options: FirebaseAuthProviderOptions): AuthProvider {
    const mapUser = options.mapUser ?? defaultMapUser;
    const capabilities = new Set<AuthCapability>([
        "signIn",
        "signOut",
        "register",
        "getSession",
        "refresh",
        "getUser",
        "passwordReset",
        "emailVerification",
    ]);

    return {
        id: "firebase",
        capabilities,
        signIn: async (credentials) => {
            try {
                const result = await options.auth.signInWithEmailAndPassword(
                    credentials.email,
                    credentials.password,
                );
                return toResult(result.user, mapUser);
            } catch {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Firebase sign-in failed");
            }
        },
        register: async (credentials) => {
            try {
                const result = await options.auth.createUserWithEmailAndPassword(
                    credentials.email,
                    credentials.password,
                );
                return toResult(result.user, mapUser);
            } catch {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Firebase register failed");
            }
        },
        signOut: async () => {
            await options.auth.signOut();
        },
        getSession: async () => {
            const user = options.auth.currentUser;
            if (!user) {
                return null;
            }
            return (await toResult(user, mapUser)).session;
        },
        refresh: async (session: AuthSession) => {
            const user = options.auth.currentUser;
            if (!user || user.uid !== session.user?.id) {
                throw createAuthError("AUTH_REFRESH_FAILED", "Firebase user missing for refresh");
            }
            return toResult(user, mapUser, true);
        },
        getUser: async (session) => session.user,
        requestPasswordReset: async (email) => {
            await options.auth.sendPasswordResetEmail(email);
        },
        verifyEmail: async () => {
            const user = options.auth.currentUser;
            if (!user || !options.auth.sendEmailVerification) {
                throw createAuthError(
                    "AUTH_UNSUPPORTED",
                    "Firebase email verification unavailable",
                );
            }
            await options.auth.sendEmailVerification(user);
        },
    };
}
