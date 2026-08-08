import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveButton, type ButtonViewModel, type ResolveButtonOptions } from "../button/index.js";

export type ResolveToggleButtonOptions = ResolveButtonOptions & {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
};

export function resolveToggleButton(
    options: ResolveToggleButtonOptions & { pressed: boolean },
): ButtonViewModel {
    const view = resolveButton(options);
    return {
        ...view,
        attributes: {
            ...view.attributes,
            "aria-pressed": options.pressed ? "true" : "false",
            "data-pressed": options.pressed ? "true" : "false",
        },
    };
}

export type ToggleButtonController = {
    readonly pressed: ControllableState<boolean>;
    resolve(
        options?: Omit<
            ResolveToggleButtonOptions,
            "pressed" | "defaultPressed" | "onPressedChange"
        >,
    ): ButtonViewModel;
    toggle(): void;
};

export function createToggleButtonController(
    options: ResolveToggleButtonOptions = {},
): ToggleButtonController {
    const pressed = createControllableState({
        defaultValue: options.defaultPressed ?? false,
        ...(options.pressed === undefined ? {} : { value: options.pressed }),
        ...(options.onPressedChange === undefined ? {} : { onChange: options.onPressedChange }),
    });

    return {
        pressed,
        resolve(styleOptions = {}) {
            return resolveToggleButton({
                ...styleOptions,
                pressed: pressed.get(),
            });
        },
        toggle() {
            pressed.set(!pressed.get());
        },
    };
}
