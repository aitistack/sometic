import { hasCapability, type AuthCapability } from "../capabilities.js";
import { createAuthError } from "../errors.js";
import type {
    AuthProvider,
    AuthProviderResult,
    AuthSession,
    RegisterCredentials,
    SignInCredentials,
} from "../provider.js";

export type AuthFlowContext = {
    provider: AuthProvider;
    session: AuthSession;
};

export type AuthFlowRunner<TInput, TResult> = (
    context: AuthFlowContext,
    input: TInput,
) => Promise<TResult>;

function assertFlowCapability(provider: AuthProvider, capability: AuthCapability): void {
    if (!hasCapability(provider.capabilities, capability)) {
        throw createAuthError("AUTH_UNSUPPORTED", `Provider does not support ${capability}`);
    }
}

export async function runSignInFlow(
    context: AuthFlowContext,
    credentials: SignInCredentials,
): Promise<AuthProviderResult> {
    assertFlowCapability(context.provider, "signIn");
    return context.provider.signIn!(credentials);
}

export async function runSignOutFlow(context: AuthFlowContext): Promise<void> {
    assertFlowCapability(context.provider, "signOut");
    await context.provider.signOut?.(context.session);
}

export async function runRegisterFlow(
    context: AuthFlowContext,
    credentials: RegisterCredentials,
): Promise<AuthProviderResult> {
    assertFlowCapability(context.provider, "register");
    return context.provider.register!(credentials);
}

export async function runGetSessionFlow(context: AuthFlowContext): Promise<AuthSession | null> {
    assertFlowCapability(context.provider, "getSession");
    return context.provider.getSession!();
}

export async function runRefreshFlow(context: AuthFlowContext): Promise<AuthProviderResult> {
    assertFlowCapability(context.provider, "refresh");
    return context.provider.refresh!(context.session);
}

export async function runPasswordResetFlow(context: AuthFlowContext, email: string): Promise<void> {
    assertFlowCapability(context.provider, "passwordReset");
    await context.provider.requestPasswordReset?.(email);
}

export async function runVerifyEmailFlow(context: AuthFlowContext, token: string): Promise<void> {
    assertFlowCapability(context.provider, "emailVerification");
    await context.provider.verifyEmail?.(token);
}
