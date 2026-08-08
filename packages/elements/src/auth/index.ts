import type { AuthController, AuthSession } from "@sometic/auth";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

class SometicAuthStatus extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["shadow"];
    }

    #auth: AuthController | null = null;
    #unsubscribe: (() => void) | null = null;
    #status = document.createElement("span");
    #mounted = false;

    connectedCallback(): void {
        if (!this.#mounted) {
            this.#status.setAttribute("data-part", "status");
            getElementMountRoot(this).append(this.#status);
            this.#mounted = true;
        }
        this.#render(this.#auth?.getSession() ?? null);
    }

    disconnectedCallback(): void {
        this.#unsubscribe?.();
        this.#unsubscribe = null;
    }

    get auth(): AuthController | null {
        return this.#auth;
    }

    set auth(value: AuthController | null) {
        this.#unsubscribe?.();
        this.#auth = value;
        if (!value) {
            this.#render(null);
            return;
        }
        this.#unsubscribe = value.subscribe((session) => {
            this.#render(session);
        });
    }

    #render(session: AuthSession | null): void {
        if (!session) {
            this.#status.textContent = "anonymous";
            this.setAttribute("data-status", "anonymous");
            return;
        }
        this.#status.textContent = session.status;
        this.setAttribute("data-status", session.status);
        if (session.user?.email) {
            this.setAttribute("data-email", session.user.email);
        } else {
            this.removeAttribute("data-email");
        }
    }
}

export function registerAuthElements(registry: CustomElementRegistry = customElements): void {
    defineElement("sometic-auth-status", SometicAuthStatus, registry);
}

if (canUseCustomElements()) {
    registerAuthElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-auth-status": SometicAuthStatus;
    }
}

export { SometicAuthStatus };
