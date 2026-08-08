import { createMutationObserver, createQueryClient, createQueryObserver } from "@sometic/query";

type Item = {
    id: number;
    title: string;
};

const ITEMS_KEY = ["items"] as const;

function delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason instanceof Error ? signal.reason : new Error("Aborted"));
            return;
        }
        const timer = setTimeout(() => {
            resolve();
        }, ms);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                reject(signal.reason instanceof Error ? signal.reason : new Error("Aborted"));
            },
            { once: true },
        );
    });
}

function clearChildren(node: HTMLElement): void {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function appendStatusItem(listEl: HTMLElement, text: string): void {
    const li = document.createElement("li");
    li.className = "pg-query-empty";
    li.textContent = text;
    listEl.appendChild(li);
}

export function mountQuerySection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-query-status]");
    const listEl = root.querySelector<HTMLElement>("[data-query-list]");
    const input = root.querySelector<HTMLInputElement>("[data-query-title]");
    const addButton = root.querySelector<HTMLButtonElement>("[data-query-add]");
    const refetchButton = root.querySelector<HTMLButtonElement>("[data-query-refetch]");

    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    let serverItems: Item[] = [
        { id: 1, title: "Alpha" },
        { id: 2, title: "Beta" },
    ];
    let nextId = 3;

    const client = createQueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                retry: false,
            },
        },
    });

    const fetchItems = async (signal?: AbortSignal): Promise<Item[]> => {
        await delay(350, signal);
        return serverItems.map((item) => ({ ...item }));
    };

    const observer = createQueryObserver<Item[]>(client, {
        queryKey: ITEMS_KEY,
        queryFn: async ({ signal }) => fetchItems(signal),
    });

    const mutation = createMutationObserver<Item, Error, string, { previous: Item[] | undefined }>(
        client,
        {
            mutationFn: async (title, { signal }) => {
                await delay(400, signal);
                const item: Item = { id: nextId, title };
                nextId += 1;
                serverItems = [...serverItems, item];
                return item;
            },
            async onMutate(title) {
                const previous = client.getQueryData<Item[]>(ITEMS_KEY);
                const optimistic: Item = { id: -Date.now(), title };
                client.setQueryData<Item[]>(ITEMS_KEY, (current) => [
                    ...(current ?? []),
                    optimistic,
                ]);
                return { previous };
            },
            onError(_error, _title, context) {
                if (context?.previous) {
                    client.setQueryData(ITEMS_KEY, context.previous);
                }
            },
            invalidateKeys: [ITEMS_KEY],
        },
    );

    const render = (): void => {
        const result = observer.getCurrentResult();
        const mutationResult = mutation.getCurrentResult();

        if (listEl) {
            clearChildren(listEl);
            if (result.isPending && !result.data) {
                appendStatusItem(listEl, "Loading…");
            } else if (result.isError) {
                appendStatusItem(listEl, `Error: ${result.error?.message ?? "failed"}`);
            } else if (result.isEmpty) {
                appendStatusItem(listEl, "No items");
            } else {
                for (const item of result.data ?? []) {
                    const li = document.createElement("li");
                    li.className = `pg-query-item${item.id < 0 ? " pg-query-item--optimistic" : ""}`;
                    li.dataset.id = String(item.id);
                    li.textContent = item.title;
                    listEl.appendChild(li);
                }
            }
        }

        if (addButton) {
            addButton.disabled = mutationResult.isPending;
        }

        const flags = [
            `status=${result.status}`,
            result.isFetching ? "fetching" : null,
            result.isStale ? "stale" : null,
            mutationResult.isPending ? "mutating" : null,
        ]
            .filter(Boolean)
            .join(" · ");
        log(flags || "Query ready");
    };

    const unsubQuery = observer.subscribe(() => {
        render();
    });
    const unsubMutation = mutation.subscribe(() => {
        render();
    });

    const onAdd = (): void => {
        const title = input?.value.trim() || `Item ${String(nextId)}`;
        if (input) {
            input.value = "";
        }
        void mutation.mutate(title).catch(() => {
            log(`Mutation failed: ${mutation.getCurrentResult().error?.message ?? "error"}`);
        });
    };

    const onRefetch = (): void => {
        void observer.refetch();
    };

    const onTitleKeydown = (event: KeyboardEvent): void => {
        if (event.key === "Enter") {
            onAdd();
        }
    };

    addButton?.addEventListener("click", onAdd);
    refetchButton?.addEventListener("click", onRefetch);
    input?.addEventListener("keydown", onTitleKeydown);

    render();

    return () => {
        addButton?.removeEventListener("click", onAdd);
        refetchButton?.removeEventListener("click", onRefetch);
        input?.removeEventListener("keydown", onTitleKeydown);
        unsubQuery();
        unsubMutation();
        observer.destroy();
        mutation.destroy();
        client.dispose();
    };
}
