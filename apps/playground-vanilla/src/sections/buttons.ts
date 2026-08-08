import { bindButton, type BindButtonOptions } from "@sometic/dom/button";
import "@sometic/elements/button";
import type { SometicAsyncButton } from "@sometic/elements/button";

const SHADOW_BUTTON_CSS = `
button {
  appearance: none;
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  background: color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
  border-radius: 10px;
  padding: 0.55rem 0.95rem;
  font: inherit;
  cursor: pointer;
}
button[disabled] { opacity: 0.55; cursor: not-allowed; }
button[data-loading="true"] { opacity: 0.75; }
`;

export function mountButtonsSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-buttons-status]");
    const vanilla = root.querySelector<HTMLButtonElement>("#vanilla-bind");
    const loadingToggle = root.querySelector<HTMLButtonElement>("[data-buttons-loading]");
    const wcLoading = root.querySelector<HTMLElement>("sometic-button[data-demo='loading']");
    const asyncButton = root.querySelector<SometicAsyncButton>("sometic-async-button");
    const shadowButton = root.querySelector<HTMLElement>("sometic-button[data-demo='shadow-mode']");

    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    if (shadowButton?.shadowRoot && !shadowButton.shadowRoot.querySelector("style[data-pg]")) {
        const style = document.createElement("style");
        style.setAttribute("data-pg", "");
        style.textContent = SHADOW_BUTTON_CSS;
        shadowButton.shadowRoot.prepend(style);
    }

    if (asyncButton) {
        asyncButton.action = async (signal) => {
            await new Promise<void>((resolve, reject) => {
                const timer = window.setTimeout(() => resolve(), 700);
                signal.addEventListener("abort", () => {
                    window.clearTimeout(timer);
                    reject(new DOMException("Aborted", "AbortError"));
                });
            });
            return { ok: true };
        };
    }

    let loading = false;
    let binding: ReturnType<typeof bindButton> | undefined;

    const getOptions = (): BindButtonOptions => ({
        loading,
        classes: { root: "bound" },
        onPress: () => {
            log(`Vanilla bindButton pressed · loading=${String(loading)}`);
        },
    });

    const rebind = (): void => {
        binding?.dispose();
        if (vanilla) {
            binding = bindButton(vanilla, getOptions);
        }
    };

    rebind();

    const onLoadingToggle = (): void => {
        loading = !loading;
        if (loadingToggle) {
            loadingToggle.textContent = loading ? "Clear loading" : "Set loading";
        }
        if (wcLoading) {
            if (loading) {
                wcLoading.setAttribute("loading", "");
            } else {
                wcLoading.removeAttribute("loading");
            }
        }
        rebind();
        log(`Loading=${String(loading)} · try WC + vanilla buttons`);
    };

    const onBasicClick = (): void => {
        log("sometic-button clicked");
    };
    const onPressedChange = ((event: CustomEvent<{ pressed: boolean }>) => {
        log(`sometic-toggle-button pressed=${String(event.detail.pressed)}`);
    }) as EventListener;
    const onAsyncComplete = ((event: CustomEvent<{ data: unknown }>) => {
        log(`sometic-async-button complete · ${JSON.stringify(event.detail.data)}`);
    }) as EventListener;

    loadingToggle?.addEventListener("click", onLoadingToggle);
    root.querySelector("sometic-button[data-demo='basic']")?.addEventListener("click", onBasicClick);
    root.querySelector("sometic-toggle-button")?.addEventListener("pressed-change", onPressedChange);
    asyncButton?.addEventListener("async-complete", onAsyncComplete);

    log(
        "Buttons ready · Light default · Shadow demo styled via injected :host rules · registerButtonElements is idempotent",
    );

    return () => {
        loadingToggle?.removeEventListener("click", onLoadingToggle);
        root.querySelector("sometic-button[data-demo='basic']")?.removeEventListener(
            "click",
            onBasicClick,
        );
        root.querySelector("sometic-toggle-button")?.removeEventListener(
            "pressed-change",
            onPressedChange,
        );
        asyncButton?.removeEventListener("async-complete", onAsyncComplete);
        binding?.dispose();
    };
}
