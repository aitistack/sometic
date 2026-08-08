import { createDialogController, type DialogController } from "@sometic/dom/dialog";
import {
    createPopoverController,
    type Placement,
    type PopoverController,
} from "@sometic/dom/popover";
import { createTooltipController, type TooltipController } from "@sometic/dom/tooltip";
import { createToastQueue, type ToastItem, type ToastQueue } from "@sometic/dom/toast";
import { resolveAlert } from "@sometic/dom/alert";
import { boolAttr } from "../shared/attrs.js";
import { dispatchSometicEvent } from "../shared/events.js";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

export type SometicOpenChangeDetail = {
    open: boolean;
};

export type SometicToastChangeDetail = {
    items: readonly ToastItem[];
};

const PLACEMENTS = new Set<string>([
    "top",
    "top-start",
    "top-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "left-start",
    "left-end",
    "right",
    "right-start",
    "right-end",
]);

function parsePlacement(value: string | null): Placement | undefined {
    if (value && PLACEMENTS.has(value)) {
        return value as Placement;
    }
    return undefined;
}

class SometicDialog extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["open", "shadow"];
    }

    #panel = document.createElement("div");
    #mounted = false;
    #controller: DialogController | null = null;

    #ensureController(): DialogController {
        if (this.#controller && !this.#controller.disposed) {
            return this.#controller;
        }
        this.#controller = createDialogController({
            getContent: () => this.#panel,
            onOpenChange: (open) => {
                if (open) {
                    this.setAttribute("open", "");
                } else {
                    this.removeAttribute("open");
                }
                dispatchSometicEvent<SometicOpenChangeDetail>(this, "open-change", { open });
                this.#render();
            },
        });
        return this.#controller;
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            this.#panel.setAttribute("data-slot", "panel");
            while (this.firstChild) {
                this.#panel.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#panel);
            this.#mounted = true;
        }
        this.#ensureController().setOpen(boolAttr(this.getAttribute("open")));
        this.#render();
    }

    attributeChangedCallback(name: string): void {
        if (name === "open" && this.isConnected) {
            this.#ensureController().setOpen(boolAttr(this.getAttribute("open")));
            this.#render();
        }
    }

    disconnectedCallback(): void {
        this.#controller?.dispose();
        this.#controller = null;
    }

    #render(): void {
        const view = this.#ensureController().resolve();
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#panel.setAttribute(key, value);
        }
        this.#panel.hidden = !view.open;
        this.#panel.className = view.className;
        Object.assign(this.#panel.style, view.style);
        this.#panel.style.display = view.open ? "" : "none";
    }
}

class SometicPopover extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["open", "placement", "shadow"];
    }

    #panel = document.createElement("div");
    #mounted = false;
    #controller: PopoverController | null = null;

    #ensureController(): PopoverController {
        if (this.#controller && !this.#controller.disposed) {
            return this.#controller;
        }
        this.#controller = createPopoverController({
            getContent: () => this.#panel,
            onOpenChange: (open) => {
                if (open) {
                    this.setAttribute("open", "");
                } else {
                    this.removeAttribute("open");
                }
                dispatchSometicEvent<SometicOpenChangeDetail>(this, "open-change", { open });
                this.#render();
            },
        });
        return this.#controller;
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            this.#panel.setAttribute("data-slot", "panel");
            while (this.firstChild) {
                this.#panel.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#panel);
            this.#mounted = true;
        }
        this.#ensureController().setOpen(boolAttr(this.getAttribute("open")));
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#ensureController().setOpen(boolAttr(this.getAttribute("open")));
            this.#render();
        }
    }

    disconnectedCallback(): void {
        this.#controller?.dispose();
        this.#controller = null;
    }

    #render(): void {
        const placement = parsePlacement(this.getAttribute("placement"));
        const view = this.#ensureController().resolve();
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#panel.setAttribute(key, value);
        }
        if (placement) {
            this.#panel.setAttribute("data-placement", placement);
        }
        this.#panel.className = view.className;
        Object.assign(this.#panel.style, view.style);
        this.#panel.style.display = view.open ? "" : "none";
    }
}

class SometicTooltip extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["open", "placement", "shadow"];
    }

    #content: HTMLElement = document.createElement("div");
    #mounted = false;
    #controller: TooltipController | null = null;

    #ensureController(): TooltipController {
        if (this.#controller && !this.#controller.disposed) {
            return this.#controller;
        }
        this.#controller = createTooltipController({
            onOpenChange: (open) => {
                if (open) {
                    this.setAttribute("open", "");
                } else {
                    this.removeAttribute("open");
                }
                dispatchSometicEvent<SometicOpenChangeDetail>(this, "open-change", { open });
                this.#render();
            },
        });
        return this.#controller;
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            this.#content.setAttribute("data-slot", "content");
            const existing = [...this.childNodes];
            for (const node of existing) {
                if (node instanceof HTMLElement && node.getAttribute("data-slot") === "content") {
                    this.#content = node;
                }
            }
            if (!this.#content.isConnected) {
                getElementMountRoot(this).append(this.#content);
            }
            this.#mounted = true;
            this.addEventListener("pointerenter", this.#onEnter);
            this.addEventListener("pointerleave", this.#onLeave);
            this.addEventListener("focusin", this.#onEnter);
            this.addEventListener("focusout", this.#onLeave);
        }
        this.#render();
    }

    disconnectedCallback(): void {
        this.removeEventListener("pointerenter", this.#onEnter);
        this.removeEventListener("pointerleave", this.#onLeave);
        this.removeEventListener("focusin", this.#onEnter);
        this.removeEventListener("focusout", this.#onLeave);
        this.#controller?.dispose();
        this.#controller = null;
        this.#mounted = false;
    }

    #onEnter = (): void => {
        this.#ensureController().scheduleOpen();
    };

    #onLeave = (): void => {
        this.#ensureController().scheduleClose();
    };

    #render(): void {
        const view = this.#ensureController().resolve();
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#content.setAttribute(key, value);
        }
        this.#content.className = view.className;
        Object.assign(this.#content.style, view.style);
        this.#content.style.display = view.open ? "" : "none";
        if (view.open && this.firstElementChild instanceof HTMLElement) {
            this.#ensureController().updatePosition(this.firstElementChild, this.#content);
            Object.assign(this.#content.style, this.#ensureController().resolve().style);
        }
    }
}

class SometicToastRegion extends HTMLElement {
    #queue: ToastQueue | null = null;
    #list = document.createElement("div");
    #mounted = false;

    #ensureQueue(): ToastQueue {
        if (this.#queue && !this.#queue.disposed) {
            return this.#queue;
        }
        this.#queue = createToastQueue({
            onChange: (items) => {
                dispatchSometicEvent<SometicToastChangeDetail>(this, "toast-change", { items });
                this.#render(items);
            },
        });
        return this.#queue;
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            this.#list.setAttribute("data-slot", "list");
            getElementMountRoot(this).append(this.#list);
            this.#mounted = true;
        }
        this.#render(this.#ensureQueue().items);
    }

    disconnectedCallback(): void {
        this.#queue?.dispose();
        this.#queue = null;
        this.#mounted = false;
    }

    push(input: { title: string; description?: string; durationMs?: number }): ToastItem {
        return this.#ensureQueue().push(input);
    }

    dismiss(id: string): void {
        this.#ensureQueue().dismiss(id);
    }

    clear(): void {
        this.#ensureQueue().clear();
    }

    #render(items: readonly ToastItem[]): void {
        this.#list.replaceChildren(
            ...items.map((item) => {
                const node = document.createElement("div");
                node.setAttribute("data-slot", "toast");
                node.setAttribute("data-toast-id", item.id);
                node.textContent = item.description
                    ? `${item.title} — ${item.description}`
                    : item.title;
                return node;
            }),
        );
    }
}

class SometicAlert extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["tone", "live", "shadow"];
    }

    connectedCallback(): void {
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const tone = this.getAttribute("tone");
        const live = this.getAttribute("live");
        const view = resolveAlert({
            ...(tone === "info" || tone === "success" || tone === "warning" || tone === "danger"
                ? { tone }
                : {}),
            ...(live === "polite" || live === "assertive" ? { live } : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.className = view.className;
    }
}

export function registerOverlayElements(registry?: CustomElementRegistry): void {
    if (!canUseCustomElements()) {
        return;
    }
    defineElement("sometic-dialog", SometicDialog, registry);
    defineElement("sometic-popover", SometicPopover, registry);
    defineElement("sometic-tooltip", SometicTooltip, registry);
    defineElement("sometic-toast-region", SometicToastRegion, registry);
    defineElement("sometic-alert", SometicAlert, registry);
}

if (canUseCustomElements()) {
    registerOverlayElements();
}

export { SometicAlert, SometicDialog, SometicPopover, SometicToastRegion, SometicTooltip };

declare global {
    interface HTMLElementTagNameMap {
        "sometic-dialog": SometicDialog;
        "sometic-popover": SometicPopover;
        "sometic-tooltip": SometicTooltip;
        "sometic-toast-region": SometicToastRegion;
        "sometic-alert": SometicAlert;
    }
}
