import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useRef,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {
    can,
    createAuth,
    type AuthController,
    type AuthSession,
    type AuthorizationPolicy,
    type CreateAuthOptions,
} from "@sometic/auth";

const AuthContext = createContext<AuthController | null>(null);

export type AuthProviderProps = {
    auth?: AuthController;
    options?: CreateAuthOptions;
    children: ReactNode;
};

export function AuthProvider(props: AuthProviderProps): ReactNode {
    const createdRef = useRef<AuthController | null>(null);
    if (props.auth) {
        createdRef.current = null;
    } else if (!createdRef.current) {
        if (!props.options) {
            throw new Error("AuthProvider requires auth or options");
        }
        createdRef.current = createAuth(props.options);
    }
    const auth = props.auth ?? createdRef.current;
    if (!auth) {
        throw new Error("AuthProvider requires auth or options");
    }
    return createElement(AuthContext.Provider, { value: auth }, props.children);
}

export function useAuth(): AuthController {
    const auth = useContext(AuthContext);
    if (!auth) {
        throw new Error("useAuth requires AuthProvider");
    }
    return auth;
}

export function useSession(authProp?: AuthController): AuthSession {
    const contextAuth = useContext(AuthContext);
    const auth = authProp ?? contextAuth;
    if (!auth) {
        throw new Error("useSession requires AuthProvider or auth argument");
    }
    const subscribe = useCallback(
        (onStoreChange: () => void) => auth.subscribe(onStoreChange),
        [auth],
    );
    const getSnapshot = useCallback(() => auth.getSession(), [auth]);
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useCan(policy: AuthorizationPolicy, authProp?: AuthController): boolean {
    const contextAuth = useContext(AuthContext);
    const auth = authProp ?? contextAuth;
    if (!auth) {
        throw new Error("useCan requires AuthProvider or auth argument");
    }
    const subscribe = useCallback(
        (onStoreChange: () => void) => auth.subscribe(onStoreChange),
        [auth],
    );
    const getSnapshot = useCallback(() => auth.getSession(), [auth]);
    const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return can(session, policy);
}
