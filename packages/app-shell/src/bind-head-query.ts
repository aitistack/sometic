import type { AuthController } from "@sometic/auth";
import type { HeadController, HeadPatch } from "@sometic/head";
import {
    createQueryObserver,
    type QueryClient,
    type QueryFunction,
    type QueryKey,
} from "@sometic/query";

export type BindHeadToQueryOptions<TData> = {
    head: HeadController;
    client: QueryClient;
    queryKey: QueryKey;
    queryFn: QueryFunction<TData>;
    map: (data: TData) => HeadPatch;
    patchId?: string;
    auth?: AuthController;
};

type BindHeadToQueryResult = {
    dispose: () => void;
};

export function bindHeadToQuery<TData>(
    options: BindHeadToQueryOptions<TData>,
): BindHeadToQueryResult {
    const patchId = options.patchId ?? "query-head";
    const observer = createQueryObserver(options.client, {
        queryKey: options.queryKey,
        queryFn: options.queryFn,
        meta: { auth: true },
    });

    const apply = (): void => {
        const result = observer.getCurrentResult();
        if (!result.isSuccess || result.data === undefined || result.isEmpty) {
            options.head.remove(patchId);
            return;
        }
        options.head.set(patchId, options.map(result.data));
    };

    const stopObserver = observer.subscribe(() => {
        apply();
    });
    apply();

    let stopAuth: (() => void) | undefined;
    if (options.auth) {
        let lastEpoch = options.auth.getEpoch();
        stopAuth = options.auth.subscribe((session) => {
            if ((session.epoch ?? 0) === lastEpoch) {
                return;
            }
            lastEpoch = session.epoch ?? 0;
            options.head.remove(patchId);
        });
    }

    void observer.refetch().catch(() => undefined);

    return {
        dispose: () => {
            stopObserver();
            stopAuth?.();
            observer.destroy();
            options.head.remove(patchId);
        },
    };
}
