import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { resolveInput, type InputViewModel, type ResolveInputOptions } from "../input/index.js";

export type ResolveFileInputOptions = Omit<ResolveInputOptions, "type" | "value">;

export function resolveFileInput(options: ResolveFileInputOptions = {}): InputViewModel {
    return resolveInput({
        ...options,
        type: "file",
        value: "",
    });
}

export type CreateFileInputControllerOptions = {
    value?: File[];
    defaultValue?: File[];
    onValueChange?: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
};

export type FileInputController = {
    readonly value: ControllableState<File[]>;
    resolve(options?: ResolveFileInputOptions): InputViewModel;
    setFromList(list: FileList | null): void;
    clear(): void;
};

export function createFileInputController(
    options: CreateFileInputControllerOptions = {},
): FileInputController {
    const value = createControllableState<File[]>({
        defaultValue: options.defaultValue ?? [],
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    return {
        value,
        resolve(styleOptions = {}) {
            return resolveFileInput({
                ...styleOptions,
                ...(options.multiple === undefined ? {} : { multiple: options.multiple }),
                ...(options.accept === undefined ? {} : { accept: options.accept }),
            });
        },
        setFromList(list) {
            if (!list) {
                value.set([]);
                return;
            }
            value.set([...list]);
        },
        clear() {
            value.set([]);
        },
    };
}
