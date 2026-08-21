import { describe, expect, it } from "vitest";
import { createElement, StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { QueryClientProvider, useQuery } from "./index.js";
import { createQueryClient } from "@sometic/query";

function ItemsProbe(props: { onRender: () => void }): ReactElement {
    props.onRender();
    const result = useQuery({
        queryKey: ["items"],
        queryFn: async () => [{ id: "1" }],
        staleTime: 60_000,
        retry: false,
    });
    return createElement("div", { "data-status": result.status }, result.data?.[0]?.id ?? "");
}

async function flush(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("useQuery", () => {
    it("does not infinite-loop under Strict Mode", async () => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        const client = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        let renders = 0;
        await act(async () => {
            root.render(
                createElement(
                    StrictMode,
                    null,
                    createElement(QueryClientProvider, {
                        client,
                        children: createElement(ItemsProbe, {
                            onRender: () => {
                                renders += 1;
                            },
                        }),
                    }),
                ),
            );
        });
        for (let attempt = 0; attempt < 40; attempt += 1) {
            await flush();
            if (host.textContent?.includes("1")) {
                break;
            }
        }
        expect(renders).toBeLessThan(40);
        expect(host.textContent).toContain("1");
        await act(async () => {
            root.unmount();
        });
        client.dispose();
        host.remove();
    });

    it("survives Strict Mode remount without a disposed observer hang", async () => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        const client = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        await act(async () => {
            root.render(
                createElement(
                    StrictMode,
                    null,
                    createElement(QueryClientProvider, {
                        client,
                        children: createElement(ItemsProbe, { onRender: () => undefined }),
                    }),
                ),
            );
        });
        for (let attempt = 0; attempt < 40; attempt += 1) {
            await flush();
            if (host.querySelector("[data-status]")?.getAttribute("data-status") === "success") {
                break;
            }
        }
        expect(host.querySelector("[data-status]")?.getAttribute("data-status")).toBe("success");
        await act(async () => {
            root.unmount();
        });
        client.dispose();
        host.remove();
    });
});
