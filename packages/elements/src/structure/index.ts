import { resolveBadge } from "@sometic/dom/badge";
import { resolveProgress } from "@sometic/dom/progress";
import { resolveSkeleton } from "@sometic/dom/skeleton";
import { resolveSpinner } from "@sometic/dom/spinner";
import { canUseCustomElements, defineElement } from "../shared/register.js";

class SometicBadge extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["tone"];
    }

    connectedCallback(): void {
        this.#render();
    }

    attributeChangedCallback(): void {
        this.#render();
    }

    #render(): void {
        const tone = (this.getAttribute("tone") ?? "neutral") as
            "neutral" | "info" | "success" | "warning" | "danger";
        const view = resolveBadge({ tone });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        if (view.className) {
            this.className = view.className;
        }
    }
}

class SometicProgress extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "max"];
    }

    connectedCallback(): void {
        this.#render();
    }

    attributeChangedCallback(): void {
        this.#render();
    }

    #render(): void {
        const raw = this.getAttribute("value");
        const maxRaw = this.getAttribute("max");
        const view = resolveProgress({
            ...(raw === null ? {} : { value: Number(raw) }),
            ...(maxRaw === null ? {} : { max: Number(maxRaw) }),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        if (view.className) {
            this.className = view.className;
        }
    }
}

class SometicSpinner extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["label"];
    }

    connectedCallback(): void {
        this.#render();
    }

    attributeChangedCallback(): void {
        this.#render();
    }

    #render(): void {
        const label = this.getAttribute("label") ?? undefined;
        const view = resolveSpinner({
            ...(label === undefined ? {} : { label }),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        if (view.className) {
            this.className = view.className;
        }
    }
}

class SometicSkeleton extends HTMLElement {
    connectedCallback(): void {
        const view = resolveSkeleton();
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        if (view.className) {
            this.className = view.className;
        }
    }
}

export function registerStructureElements(registry?: CustomElementRegistry): void {
    defineElement("sometic-badge", SometicBadge, registry);
    defineElement("sometic-progress", SometicProgress, registry);
    defineElement("sometic-spinner", SometicSpinner, registry);
    defineElement("sometic-skeleton", SometicSkeleton, registry);
}

if (canUseCustomElements()) {
    registerStructureElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-badge": SometicBadge;
        "sometic-progress": SometicProgress;
        "sometic-spinner": SometicSpinner;
        "sometic-skeleton": SometicSkeleton;
    }
}
