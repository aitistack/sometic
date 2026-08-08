export function defineElement(
    tagName: string,
    ctor: CustomElementConstructor,
    registry: CustomElementRegistry = customElements,
): void {
    if (registry.get(tagName)) {
        return;
    }
    registry.define(tagName, ctor);
}

export function canUseCustomElements(): boolean {
    return typeof customElements !== "undefined";
}
