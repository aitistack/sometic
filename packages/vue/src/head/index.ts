import { inject, onScopeDispose, provide, watchEffect, type InjectionKey } from "vue";
import {
    applyHead,
    createHeadController,
    type CreateHeadControllerOptions,
    type HeadController,
    type HeadPatch,
} from "@sometic/head";

const headKey: InjectionKey<HeadController> = Symbol("sometic-head");

export function provideHead(
    options: CreateHeadControllerOptions | HeadController = {},
    apply = true,
): HeadController {
    const controller =
        options && "get" in options && "set" in options
            ? options
            : createHeadController(options as CreateHeadControllerOptions);
    provide(headKey, controller);
    if (apply) {
        const stop = controller.subscribe((snapshot) => {
            applyHead(document, snapshot);
        });
        applyHead(document, controller.get());
        onScopeDispose(() => {
            stop();
            if (!(options && "get" in options && "set" in options)) {
                controller.dispose();
            }
        });
    } else {
        onScopeDispose(() => {
            if (!(options && "get" in options && "set" in options)) {
                controller.dispose();
            }
        });
    }
    return controller;
}

export function useHead(
    patch: HeadPatch,
    id = `head-${Math.random().toString(36).slice(2)}`,
): void {
    const controller = inject(headKey);
    if (!controller) {
        throw new Error("useHead requires provideHead");
    }
    watchEffect((onCleanup) => {
        controller.set(id, patch);
        onCleanup(() => {
            controller.remove(id);
        });
    });
}

export function useHeadController(): HeadController {
    const controller = inject(headKey);
    if (!controller) {
        throw new Error("useHeadController requires provideHead");
    }
    return controller;
}

export { createHeadController, applyHead, serializeHead } from "@sometic/head";
export type { HeadController, HeadPatch, HeadSnapshot } from "@sometic/head";
