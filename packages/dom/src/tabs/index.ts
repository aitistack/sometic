import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type ResolveTabsOptions = StyleableProps<"root"> & {
    orientation?: "horizontal" | "vertical";
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TabsViewModel = {
    orientation: "horizontal" | "vertical";
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTabs(options: ResolveTabsOptions = {}): TabsViewModel {
    const orientation = options.orientation ?? "horizontal";
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        orientation,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "tablist",
            "data-slot": "root",
            "data-orientation": orientation,
            "aria-orientation": orientation,
        },
    };
}

export type ResolveTabTriggerOptions = StyleableProps<"root"> & {
    value: string;
    selected?: boolean;
    disabled?: boolean;
    controls?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TabTriggerViewModel = {
    value: string;
    selected: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTabTrigger(options: ResolveTabTriggerOptions): TabTriggerViewModel {
    const selected = options.selected === true;
    const disabled = options.disabled === true;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        value: options.value,
        selected,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "tab",
            "data-slot": "trigger",
            "data-state": selected ? "active" : "inactive",
            "aria-selected": selected ? "true" : "false",
            tabindex: selected ? "0" : "-1",
            ...(options.controls ? { "aria-controls": options.controls } : {}),
            ...(disabled ? { "aria-disabled": "true", disabled: "" } : {}),
        },
    };
}

export type ResolveTabPanelOptions = StyleableProps<"root"> & {
    value: string;
    selected?: boolean;
    labelledBy?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TabPanelViewModel = {
    value: string;
    selected: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTabPanel(options: ResolveTabPanelOptions): TabPanelViewModel {
    const selected = options.selected === true;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    const attributes: Record<string, string> = {
        role: "tabpanel",
        "data-slot": "panel",
        "data-state": selected ? "active" : "inactive",
        ...(options.labelledBy ? { "aria-labelledby": options.labelledBy } : {}),
    };
    if (!selected) {
        attributes.hidden = "";
    }
    return {
        value: options.value,
        selected,
        className: styled.className,
        style: styled.style,
        attributes,
    };
}

export type CreateTabsControllerOptions = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
};

export type TabsController = {
    readonly value: ControllableState<string>;
    resolve(options?: ResolveTabsOptions): TabsViewModel;
    resolveTrigger(options: Omit<ResolveTabTriggerOptions, "selected">): TabTriggerViewModel;
    resolvePanel(options: Omit<ResolveTabPanelOptions, "selected">): TabPanelViewModel;
    setValue(value: string): void;
};

export function createTabsController(options: CreateTabsControllerOptions = {}): TabsController {
    const value = createControllableState<string>({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    return {
        value,
        resolve(styleOptions = {}) {
            return resolveTabs(styleOptions);
        },
        resolveTrigger(triggerOptions) {
            return resolveTabTrigger({
                ...triggerOptions,
                selected: value.get() === triggerOptions.value,
            });
        },
        resolvePanel(panelOptions) {
            return resolveTabPanel({
                ...panelOptions,
                selected: value.get() === panelOptions.value,
            });
        },
        setValue(next) {
            value.set(next);
        },
    };
}
