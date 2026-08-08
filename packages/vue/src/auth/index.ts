import { computed, onScopeDispose, shallowRef, type ComputedRef, type ShallowRef } from "vue";
import {
    createAuth,
    type AuthController,
    type AuthSession,
    type AuthorizationPolicy,
    type CreateAuthOptions,
} from "@sometic/auth";

export function useAuth(options: CreateAuthOptions | AuthController): {
    auth: AuthController;
    session: ShallowRef<AuthSession>;
} {
    const auth = "getSession" in options ? options : createAuth(options);
    const session = shallowRef(auth.getSession());
    const unsubscribe = auth.subscribe((next) => {
        session.value = next;
    });
    onScopeDispose(() => {
        unsubscribe();
        if (!("getSession" in options)) {
            auth.dispose();
        }
    });
    return { auth, session };
}

export function useSession(auth: AuthController): ShallowRef<AuthSession> {
    const session = shallowRef(auth.getSession());
    const unsubscribe = auth.subscribe((next) => {
        session.value = next;
    });
    onScopeDispose(unsubscribe);
    return session;
}

export function useCan(auth: AuthController, policy: AuthorizationPolicy): ComputedRef<boolean> {
    const session = useSession(auth);
    return computed(() => {
        void session.value;
        return auth.can(policy);
    });
}
