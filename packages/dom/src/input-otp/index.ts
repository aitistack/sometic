import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type ResolveOtpInputOptions = Omit<ResolveInputOptions, "type" | "value"> & {
    length?: number;
    value?: string;
};

export function resolveOtpInput(options: ResolveOtpInputOptions = {}): InputViewModel {
    const length = options.length ?? 6;
    const value = (options.value ?? "").slice(0, length);
    return resolveInput({
        ...options,
        type: "text",
        value,
        inputMode: options.inputMode ?? "numeric",
        autocomplete: options.autocomplete ?? "one-time-code",
    });
}

export type CreateOtpInputControllerOptions = {
    length?: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

export type OtpInputController = {
    readonly length: number;
    readonly value: ControllableState<string>;
    resolve(options?: Omit<ResolveOtpInputOptions, "value" | "length">): InputViewModel;
    setCharAt(index: number, char: string): void;
    applyPaste(text: string): void;
    clear(): void;
};

function sanitizeOtp(text: string, length: number): string {
    return text.replace(/\D/g, "").slice(0, length);
}

export function createOtpInputController(
    options: CreateOtpInputControllerOptions = {},
): OtpInputController {
    const length = options.length ?? 6;
    const value = createControllableState({
        defaultValue: sanitizeOtp(options.defaultValue ?? "", length),
        ...(options.value === undefined ? {} : { value: sanitizeOtp(options.value, length) }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        length,
        value,
        resolve(styleOptions = {}) {
            return resolveOtpInput({
                ...styleOptions,
                length,
                value: value.get(),
            });
        },
        setCharAt(index, char) {
            if (index < 0 || index >= length) {
                return;
            }
            const digit = sanitizeOtp(char, 1);
            const current = value.get();
            if (!digit) {
                value.set(current.slice(0, index) + current.slice(index + 1));
                return;
            }
            if (index >= current.length) {
                value.set((current + digit).slice(0, length));
                return;
            }
            value.set(
                (current.slice(0, index) + digit + current.slice(index + 1)).slice(0, length),
            );
        },
        applyPaste(text) {
            value.set(sanitizeOtp(text, length));
        },
        clear() {
            value.set("");
        },
    };
}
