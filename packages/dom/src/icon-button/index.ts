import { resolveButton, type ButtonViewModel, type ResolveButtonOptions } from "../button/index.js";

export type ResolveIconButtonOptions = ResolveButtonOptions & {
    "aria-label": string;
};

export function resolveIconButton(options: ResolveIconButtonOptions): ButtonViewModel {
    const label = options["aria-label"].trim();
    if (label.length === 0) {
        throw new Error("IconButton requires a non-empty aria-label");
    }
    const view = resolveButton(options);
    return {
        ...view,
        attributes: {
            ...view.attributes,
            "aria-label": label,
        },
    };
}
