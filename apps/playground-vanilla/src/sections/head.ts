import { applyHead, createHeadController } from "@sometic/head";

const PLAYGROUND_TITLE = "Vanilla playground";
const TITLE_TEMPLATE = "%s · Sometic";

export function mountHeadSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-head-status]");
    const titleInput = root.querySelector<HTMLInputElement>("[data-head-title]");
    const applyButton = root.querySelector<HTMLButtonElement>("[data-head-apply]");
    const resetButton = root.querySelector<HTMLButtonElement>("[data-head-reset]");
    const liveTitle = root.querySelector<HTMLElement>("[data-head-live]");

    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    const head = createHeadController({
        initial: {
            title: PLAYGROUND_TITLE,
            titleTemplate: TITLE_TEMPLATE,
            meta: [{ name: "description", content: "Sometic vanilla playground harness" }],
        },
    });

    const syncLive = (): void => {
        applyHead(document, head.get());
        if (liveTitle) {
            liveTitle.textContent = document.title;
        }
        log(`document.title = ${document.title}`);
    };

    const unsubscribe = head.subscribe(() => {
        syncLive();
    });

    if (titleInput) {
        titleInput.value = PLAYGROUND_TITLE;
    }

    const onApply = (): void => {
        const next = titleInput?.value.trim() || PLAYGROUND_TITLE;
        head.set("page", { title: next });
    };

    const onReset = (): void => {
        if (titleInput) {
            titleInput.value = PLAYGROUND_TITLE;
        }
        head.remove("page");
        syncLive();
    };

    const onTitleKeydown = (event: KeyboardEvent): void => {
        if (event.key === "Enter") {
            onApply();
        }
    };

    applyButton?.addEventListener("click", onApply);
    resetButton?.addEventListener("click", onReset);
    titleInput?.addEventListener("keydown", onTitleKeydown);

    syncLive();

    return () => {
        applyButton?.removeEventListener("click", onApply);
        resetButton?.removeEventListener("click", onReset);
        titleInput?.removeEventListener("keydown", onTitleKeydown);
        unsubscribe();
        head.dispose();
    };
}
