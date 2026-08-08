import type { FormController, DraftController } from "@sometic/forms";
import { mapServerErrorBody } from "@sometic/forms/server";
import type { MutationObserver, QueryClient, QueryKey } from "@sometic/query";

type ServerIssue = ReturnType<typeof mapServerErrorBody>[number];

export type BindMutationFormOptions<
    TValues extends Record<string, unknown>,
    TData,
    TError,
    TVariables,
    TContext,
> = {
    form: FormController<TValues>;
    mutation: MutationObserver<TData, TError, TVariables, TContext>;
    mapError?: (error: unknown) => ServerIssue[];
    invalidateKeys?: readonly QueryKey[];
    queryClient?: QueryClient;
    clearDraftOnSuccess?: DraftController<TValues>;
    getEpoch?: () => number;
    getVariables?: () => TVariables;
};

export type BindMutationFormResult<TData = unknown> = {
    submit: () => Promise<TData | undefined>;
    dispose: () => void;
};

export function bindMutationForm<
    TValues extends Record<string, unknown>,
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown,
>(
    options: BindMutationFormOptions<TValues, TData, TError, TVariables, TContext>,
): BindMutationFormResult<TData> {
    const mapError =
        options.mapError ??
        ((error: unknown) => {
            if (error && typeof error === "object" && "details" in error) {
                const details = (error as { details?: { body?: unknown; data?: unknown } }).details;
                return mapServerErrorBody(details?.body ?? details?.data ?? error);
            }
            return mapServerErrorBody(error);
        });

    return {
        submit: async () => {
            const epochAtStart = options.getEpoch?.();
            options.form.clearServerErrors();
            const valid = await options.form.validateForm();
            if (!valid) {
                return undefined;
            }
            const variables = options.getVariables
                ? options.getVariables()
                : (options.form.getValues() as unknown as TVariables);
            try {
                const result = await options.mutation.mutate(variables);
                if (epochAtStart !== undefined && options.getEpoch?.() !== epochAtStart) {
                    return undefined;
                }
                if (options.queryClient && options.invalidateKeys) {
                    await Promise.all(
                        options.invalidateKeys.map((queryKey) =>
                            options.queryClient!.invalidateQueries({ queryKey }),
                        ),
                    );
                }
                if (options.clearDraftOnSuccess) {
                    await options.clearDraftOnSuccess.clear();
                }
                return result;
            } catch (error) {
                if (epochAtStart !== undefined && options.getEpoch?.() !== epochAtStart) {
                    throw error;
                }
                options.form.setServerErrors(mapError(error));
                throw error;
            }
        },
        dispose: () => undefined,
    };
}
