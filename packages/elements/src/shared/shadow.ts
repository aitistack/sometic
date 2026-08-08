export type ElementMountMode = "light" | "shadow";

export function resolveElementMode(host: HTMLElement): ElementMountMode {
    return host.hasAttribute("shadow") ? "shadow" : "light";
}

export function getElementMountRoot(host: HTMLElement): HTMLElement | ShadowRoot {
    if (resolveElementMode(host) === "shadow") {
        return host.shadowRoot ?? host.attachShadow({ mode: "open" });
    }
    return host;
}

export function mountChild(host: HTMLElement, child: Node): void {
    getElementMountRoot(host).append(child);
}

export function isMountedInHost(host: HTMLElement, child: Node): boolean {
    const root = getElementMountRoot(host);
    return root.contains(child);
}
