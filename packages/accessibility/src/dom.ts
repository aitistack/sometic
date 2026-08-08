import { canUseDom } from "@sometic/core/environment";

export function resolveDocument(
    ownerDocument?: Document | (() => Document | undefined | null),
): Document | undefined {
    if (typeof ownerDocument === "function") {
        return ownerDocument() ?? undefined;
    }
    if (ownerDocument) {
        return ownerDocument;
    }
    if (!canUseDom()) {
        return undefined;
    }
    return globalThis.document;
}

export function resolveElement<T extends Element>(
    value: T | (() => T | null | undefined) | null | undefined,
): T | undefined {
    if (typeof value === "function") {
        return value() ?? undefined;
    }
    return value ?? undefined;
}
