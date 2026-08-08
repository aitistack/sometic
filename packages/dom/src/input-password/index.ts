import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type ResolvePasswordInputOptions = Omit<ResolveInputOptions, "type"> & {
    revealed?: boolean;
};

export function resolvePasswordInput(options: ResolvePasswordInputOptions = {}): InputViewModel {
    const revealed = options.revealed === true;
    return resolveInput({
        ...options,
        type: revealed ? "text" : "password",
        autocomplete: options.autocomplete ?? "current-password",
    });
}

export type CreatePasswordInputControllerOptions = ResolvePasswordInputOptions & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    defaultRevealed?: boolean;
    onRevealedChange?: (revealed: boolean) => void;
};

export type PasswordInputController = {
    readonly value: ControllableState<string>;
    readonly revealed: ControllableState<boolean>;
    resolve(
        options?: Omit<
            ResolvePasswordInputOptions,
            "value" | "revealed" | "defaultValue" | "defaultRevealed"
        >,
    ): InputViewModel;
    toggleRevealed(): void;
};

export function createPasswordInputController(
    options: CreatePasswordInputControllerOptions = {},
): PasswordInputController {
    const value = createControllableState({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    const revealed = createControllableState({
        defaultValue: options.defaultRevealed ?? false,
        ...(options.revealed === undefined ? {} : { value: options.revealed }),
        ...(options.onRevealedChange === undefined ? {} : { onChange: options.onRevealedChange }),
    });

    return {
        value,
        revealed,
        resolve(styleOptions = {}) {
            return resolvePasswordInput({
                ...styleOptions,
                value: value.get(),
                revealed: revealed.get(),
            });
        },
        toggleRevealed() {
            revealed.set(!revealed.get());
        },
    };
}
