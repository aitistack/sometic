import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type CreateCurrencyInputControllerOptions = {
    locale?: string;
    currency?: string;
    fractionDigits?: number;
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null) => void;
};

export type CurrencyInputController = {
    readonly value: ControllableState<number | null>;
    getDisplayValue(): string;
    setFromDisplay(display: string): void;
    resolve(options?: Omit<ResolveInputOptions, "value" | "type">): InputViewModel;
};

function createFormatter(
    locale: string,
    currency: string,
    fractionDigits: number,
): Intl.NumberFormat {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

function parseCurrencyDisplay(display: string, fractionDigits: number): number | null {
    const negative = display.trim().startsWith("-") || /\(.*\)/.test(display);
    const digits = display.replace(/\D/g, "");
    if (digits.length === 0) {
        return null;
    }
    const whole = digits.slice(0, Math.max(0, digits.length - fractionDigits)) || "0";
    const fraction = digits
        .slice(Math.max(0, digits.length - fractionDigits))
        .padStart(fractionDigits, "0");
    const amount = Number(`${whole}.${fraction}`);
    if (Number.isNaN(amount)) {
        return null;
    }
    return negative ? -amount : amount;
}

export function createCurrencyInputController(
    options: CreateCurrencyInputControllerOptions = {},
): CurrencyInputController {
    const locale = options.locale ?? "en-US";
    const currency = options.currency ?? "USD";
    const fractionDigits = options.fractionDigits ?? 2;
    const formatter = createFormatter(locale, currency, fractionDigits);

    const value = createControllableState<number | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        getDisplayValue() {
            const current = value.get();
            if (current === null) {
                return "";
            }
            return formatter.format(current);
        },
        setFromDisplay(display) {
            value.set(parseCurrencyDisplay(display, fractionDigits));
        },
        resolve(styleOptions = {}) {
            const current = value.get();
            return resolveInput({
                ...styleOptions,
                type: "text",
                inputMode: "decimal",
                value: current === null ? "" : formatter.format(current),
            });
        },
    };
}
