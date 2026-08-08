import type { AuthController } from "@sometic/auth";
import type { QueryClient, QueryKey } from "@sometic/query";

export type RefetchOnReauth = "auth" | "all" | false;

export type BindQueryToAuthOptions = {
    refetchOnReauth?: RefetchOnReauth;
    authQueryKeys?: readonly QueryKey[];
    onEpochChange?: (epoch: number) => void;
};

export type BindQueryToAuthResult = {
    dispose: () => void;
};

export function bindQueryToAuth(
    auth: AuthController,
    query: QueryClient,
    options: BindQueryToAuthOptions = {},
): BindQueryToAuthResult {
    const refetchOnReauth = options.refetchOnReauth ?? "all";
    let lastEpoch = auth.getEpoch();

    const unsubSession = auth.subscribe((session) => {
        const epoch = session.epoch ?? 0;
        if (epoch === lastEpoch) {
            return;
        }
        lastEpoch = epoch;
        query.clear();
        options.onEpochChange?.(epoch);
    });

    const unsubRefresh = auth.on("tokenRefreshed", () => {
        if (refetchOnReauth === false) {
            return;
        }
        if (refetchOnReauth === "auth" && options.authQueryKeys) {
            void Promise.all(
                options.authQueryKeys.map((queryKey) => query.invalidateQueries({ queryKey })),
            );
            return;
        }
        void query.invalidateQueries();
    });

    return {
        dispose: () => {
            unsubSession();
            unsubRefresh();
        },
    };
}
