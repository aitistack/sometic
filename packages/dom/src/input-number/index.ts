import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type ResolveNumberInputOptions = Omit<ResolveInputOptions, "type" | "value"> & {
    value?: number | null;
};

export function resolveNumberInput(options: ResolveNumberInputOptions = {}): InputViewModel {
    const numeric = options.value;
    const value =
        numeric === null || numeric === undefined || Number.isNaN(numeric) ? "" : String(numeric);
    return resolveInput({
        ...options,
        type: "number",
        value,
        inputMode: options.inputMode ?? "decimal",
    });
}

export type CreateNumberInputControllerOptions = {
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
};

export type NumberInputController = {
    readonly value: ControllableState<number | null>;
    resolve(options?: Omit<ResolveNumberInputOptions, "value">): InputViewModel;
    setFromString(raw: string): void;
};

function clamp(value: number, min?: number, max?: number): number {
    let next = value;
    if (min !== undefined && next < min) {
        next = min;
    }
    if (max !== undefined && next > max) {
        next = max;
    }
    return next;
}

export function createNumberInputController(
    options: CreateNumberInputControllerOptions = {},
): NumberInputController {
    const value = createControllableState<number | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        resolve(styleOptions = {}) {
            return resolveNumberInput({
                ...styleOptions,
                value: value.get(),
                ...(options.min === undefined ? {} : { min: String(options.min) }),
                ...(options.max === undefined ? {} : { max: String(options.max) }),
            });
        },
        setFromString(raw) {
            if (raw.trim() === "") {
                value.set(null);
                return;
            }
            const parsed = Number(raw);
            if (Number.isNaN(parsed)) {
                return;
            }
            value.set(clamp(parsed, options.min, options.max));
        },
    };
}
