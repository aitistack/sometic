import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useId,
    useMemo,
    type ReactNode,
} from "react";
import {
    applyHead,
    createHeadController,
    type CreateHeadControllerOptions,
    type HeadController,
    type HeadPatch,
} from "@sometic/head";

const HeadContext = createContext<HeadController | null>(null);

export type HeadProviderProps = {
    controller?: HeadController;
    options?: CreateHeadControllerOptions;
    children: ReactNode;
    apply?: boolean;
};

export function HeadProvider(props: HeadProviderProps): ReactNode {
    const controller = useMemo(() => {
        if (props.controller) {
            return props.controller;
        }
        return createHeadController(props.options ?? {});
    }, [props.controller, props.options]);

    useEffect(() => {
        if (props.controller) {
            return;
        }
        return () => {
            controller.dispose();
        };
    }, [controller, props.controller]);

    useEffect(() => {
        if (props.apply === false) {
            return;
        }
        const sync = () => {
            applyHead(document, controller.get());
        };
        sync();
        return controller.subscribe(sync);
    }, [controller, props.apply]);

    return createElement(HeadContext.Provider, { value: controller }, props.children);
}

export function useHeadController(): HeadController {
    const controller = useContext(HeadContext);
    if (!controller) {
        throw new Error("useHeadController requires HeadProvider");
    }
    return controller;
}

export function useHead(patch: HeadPatch): void {
    const controller = useHeadController();
    const id = useId();
    useEffect(() => {
        controller.set(id, patch);
        return () => {
            controller.remove(id);
        };
    }, [controller, id, patch]);
}

export type HeadProps = HeadPatch & {
    children?: ReactNode;
};

export function Head(props: HeadProps): ReactNode {
    const { children, ...patch } = props;
    useHead(patch);
    return children ?? null;
}

export { createHeadController, applyHead, serializeHead } from "@sometic/head";
export type { HeadController, HeadPatch, HeadSnapshot } from "@sometic/head";
