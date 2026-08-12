import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import { createDisposable, type Disposable } from "@sometic/core/disposable";
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

export function shouldMountTabPanel(options: {
    selected: boolean;
    lazyMount?: boolean;
    forceMount?: boolean;
}): boolean {
    if (options.forceMount === true) {
        return true;
    }
    if (options.lazyMount === true) {
        return options.selected;
    }
    return true;
}

export type CreateTabsControllerOptions = {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
};

export type TabsController = {
    readonly value: ControllableState<string>;
    readonly orientation: "horizontal" | "vertical";
    readonly dir: "ltr" | "rtl";
    resolve(options?: ResolveTabsOptions): TabsViewModel;
    resolveTrigger(options: Omit<ResolveTabTriggerOptions, "selected">): TabTriggerViewModel;
    resolvePanel(options: Omit<ResolveTabPanelOptions, "selected">): TabPanelViewModel;
    setValue(value: string): void;
    setOrientation(orientation: "horizontal" | "vertical"): void;
    setDir(dir: "ltr" | "rtl"): void;
};

export function createTabsController(options: CreateTabsControllerOptions = {}): TabsController {
    let orientation = options.orientation ?? "horizontal";
    let dir = options.dir ?? "ltr";
    const value = createControllableState<string>({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    return {
        value,
        get orientation() {
            return orientation;
        },
        get dir() {
            return dir;
        },
        resolve(styleOptions = {}) {
            return resolveTabs({ ...styleOptions, orientation });
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
        setOrientation(next) {
            orientation = next;
        },
        setDir(next) {
            dir = next;
        },
    };
}

export type TabsKeyboardTab = {
    value: string;
    disabled?: boolean;
    element?: HTMLElement | null;
};

export type BindTabsKeyboardOptions = {
    getTabs: () => TabsKeyboardTab[];
    getSelected: () => string;
    setSelected: (value: string) => void;
    getOrientation?: () => "horizontal" | "vertical";
    getDir?: () => "ltr" | "rtl";
    loop?: boolean;
};

function isEnabledTab(tab: TabsKeyboardTab): boolean {
    return tab.disabled !== true;
}

function moveTabSelection(
    tabs: TabsKeyboardTab[],
    current: string,
    delta: number,
    loop: boolean,
): string | undefined {
    const enabled = tabs.filter(isEnabledTab);
    if (enabled.length === 0) {
        return undefined;
    }
    const currentIndex = enabled.findIndex((tab) => tab.value === current);
    const start = currentIndex >= 0 ? currentIndex : 0;
    let nextIndex = start + delta;
    if (loop) {
        nextIndex = ((nextIndex % enabled.length) + enabled.length) % enabled.length;
    } else {
        nextIndex = Math.max(0, Math.min(enabled.length - 1, nextIndex));
    }
    return enabled[nextIndex]?.value;
}

export function getTabsKeyboardTarget(
    event: Pick<KeyboardEvent, "key">,
    options: {
        tabs: TabsKeyboardTab[];
        selected: string;
        orientation?: "horizontal" | "vertical";
        dir?: "ltr" | "rtl";
        loop?: boolean;
    },
): string | undefined {
    const orientation = options.orientation ?? "horizontal";
    const dir = options.dir ?? "ltr";
    const loop = options.loop !== false;
    const rtl = dir === "rtl";
    const key = event.key;
    const horizontalPrev = rtl ? "ArrowRight" : "ArrowLeft";
    const horizontalNext = rtl ? "ArrowLeft" : "ArrowRight";

    if (orientation === "horizontal") {
        if (key === horizontalPrev) {
            return moveTabSelection(options.tabs, options.selected, -1, loop);
        }
        if (key === horizontalNext) {
            return moveTabSelection(options.tabs, options.selected, 1, loop);
        }
    } else {
        if (key === "ArrowUp") {
            return moveTabSelection(options.tabs, options.selected, -1, loop);
        }
        if (key === "ArrowDown") {
            return moveTabSelection(options.tabs, options.selected, 1, loop);
        }
    }
    if (key === "Home") {
        return options.tabs.find(isEnabledTab)?.value;
    }
    if (key === "End") {
        const enabled = options.tabs.filter(isEnabledTab);
        return enabled[enabled.length - 1]?.value;
    }
    return undefined;
}

export function bindTabsKeyboard(options: BindTabsKeyboardOptions): Disposable {
    const onKeyDown = (event: Event): void => {
        if (!(event instanceof KeyboardEvent)) {
            return;
        }
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const tabs = options.getTabs();
        const match = tabs.find((tab) => tab.element === target);
        if (!match) {
            return;
        }
        const next = getTabsKeyboardTarget(event, {
            tabs,
            selected: options.getSelected(),
            orientation: options.getOrientation?.() ?? "horizontal",
            dir: options.getDir?.() ?? "ltr",
            ...(options.loop === undefined ? {} : { loop: options.loop }),
        });
        if (next === undefined || next === options.getSelected()) {
            return;
        }
        event.preventDefault();
        options.setSelected(next);
        const nextTab = tabs.find((tab) => tab.value === next);
        nextTab?.element?.focus();
    };

    for (const tab of options.getTabs()) {
        tab.element?.addEventListener("keydown", onKeyDown);
    }

    return createDisposable(() => {
        for (const tab of options.getTabs()) {
            tab.element?.removeEventListener("keydown", onKeyDown);
        }
    });
}

export type SyncTabsToUrlOptions = {
    getValue: () => string;
    setValue: (value: string) => void;
    param?: string;
    hash?: boolean;
    getSearchParams?: () => URLSearchParams;
    setSearchParams?: (params: URLSearchParams) => void;
    getHash?: () => string;
    setHash?: (hash: string) => void;
    subscribe?: (listener: () => void) => () => void;
};

export function syncTabsToUrl(options: SyncTabsToUrlOptions): Disposable {
    const param = options.param ?? "tab";
    const useHash = options.hash === true;

    const readFromUrl = (): string | undefined => {
        if (useHash) {
            const hash = options.getHash?.() ?? "";
            const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
            return cleaned || undefined;
        }
        const params = options.getSearchParams?.();
        if (!params) {
            return undefined;
        }
        const value = params.get(param);
        return value === null || value === "" ? undefined : value;
    };

    const writeToUrl = (value: string): void => {
        if (useHash) {
            options.setHash?.(value);
            return;
        }
        const params = options.getSearchParams?.() ?? new URLSearchParams();
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        options.setSearchParams?.(params);
    };

    const applyFromUrl = (): void => {
        const fromUrl = readFromUrl();
        if (fromUrl !== undefined && fromUrl !== options.getValue()) {
            options.setValue(fromUrl);
        }
    };

    applyFromUrl();
    const current = options.getValue();
    if (current) {
        writeToUrl(current);
    }

    const unsubscribe = options.subscribe?.(() => {
        applyFromUrl();
    });

    return createDisposable(() => {
        unsubscribe?.();
    });
}
