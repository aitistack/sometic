import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type MaskToken = { kind: "digit" | "letter" | "alphanumeric" | "literal"; char: string };

export function parseMask(mask: string): MaskToken[] {
    return [...mask].map((char) => {
        if (char === "#") {
            return { kind: "digit", char };
        }
        if (char === "A") {
            return { kind: "letter", char };
        }
        if (char === "*") {
            return { kind: "alphanumeric", char };
        }
        return { kind: "literal", char };
    });
}

function matchesToken(token: MaskToken, char: string): boolean {
    if (token.kind === "digit") {
        return /^\d$/.test(char);
    }
    if (token.kind === "letter") {
        return /^[a-zA-Z]$/.test(char);
    }
    if (token.kind === "alphanumeric") {
        return /^[a-zA-Z0-9]$/.test(char);
    }
    return char === token.char;
}

export function formatMasked(raw: string, mask: string): { display: string; raw: string } {
    const tokens = parseMask(mask);
    const chars = [...raw];
    let rawIndex = 0;
    let display = "";
    let kept = "";
    for (const token of tokens) {
        if (token.kind === "literal") {
            display += token.char;
            continue;
        }
        while (rawIndex < chars.length && !matchesToken(token, chars[rawIndex]!)) {
            rawIndex += 1;
        }
        const next = chars[rawIndex];
        if (next === undefined) {
            break;
        }
        display += next;
        kept += next;
        rawIndex += 1;
    }
    return { display, raw: kept };
}

export type CreateMaskedInputControllerOptions = {
    mask: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (raw: string) => void;
};

export type MaskedInputController = {
    readonly rawValue: ControllableState<string>;
    getDisplayValue(): string;
    setRaw(raw: string): void;
    applyInput(nextDisplay: string): void;
    resolve(options?: Omit<ResolveInputOptions, "value" | "type">): InputViewModel;
};

export function createMaskedInputController(
    options: CreateMaskedInputControllerOptions,
): MaskedInputController {
    const rawValue = createControllableState({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        rawValue,
        getDisplayValue() {
            return formatMasked(rawValue.get(), options.mask).display;
        },
        setRaw(raw) {
            rawValue.set(formatMasked(raw, options.mask).raw);
        },
        applyInput(nextDisplay) {
            const stripped = [...nextDisplay].filter((char) => /[a-zA-Z0-9]/.test(char)).join("");
            rawValue.set(formatMasked(stripped, options.mask).raw);
        },
        resolve(styleOptions = {}) {
            return resolveInput({
                ...styleOptions,
                type: "text",
                value: formatMasked(rawValue.get(), options.mask).display,
            });
        },
    };
}
