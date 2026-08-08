import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { DateAdapter } from "@sometic/date-core";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type ResolveDateInputOptions = Omit<ResolveInputOptions, "type" | "value"> & {
    value?: Date | null;
    adapter: DateAdapter;
};

export function resolveDateInput(options: ResolveDateInputOptions): InputViewModel {
    const value =
        options.value == null || !options.adapter.isValid(options.value)
            ? ""
            : options.adapter.serialize(options.value);
    return resolveInput({
        ...options,
        type: "date",
        value,
    });
}

export type CreateDateInputControllerOptions = {
    adapter: DateAdapter;
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
};

export type DateInputController = {
    readonly value: ControllableState<Date | null>;
    resolve(options?: Omit<ResolveDateInputOptions, "adapter" | "value">): InputViewModel;
    setFromNativeValue(raw: string): void;
};

export function createDateInputController(
    options: CreateDateInputControllerOptions,
): DateInputController {
    const value = createControllableState<Date | null>({
        defaultValue: options.defaultValue ?? null,
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        resolve(styleOptions = {}) {
            return resolveDateInput({
                ...styleOptions,
                adapter: options.adapter,
                value: value.get(),
            });
        },
        setFromNativeValue(raw) {
            if (raw.trim() === "") {
                value.set(null);
                return;
            }
            const parsed = options.adapter.deserialize(raw);
            value.set(parsed.valid ? parsed.date : null);
        },
    };
}
