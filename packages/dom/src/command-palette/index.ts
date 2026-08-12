import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import { createOverlayController, type OverlayController } from "../overlay/index.js";

export type CommandPaletteCommand = {
    id: string;
    label: string;
    keywords?: string[];
    disabled?: boolean;
    group?: string;
};

export type ResolveCommandPaletteOptions = StyleableProps<"root"> & {
    open?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type CommandPaletteViewModel = {
    open: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveCommandPalette(
    options: ResolveCommandPaletteOptions = {},
): CommandPaletteViewModel {
    const open = options.open === true;
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
        role: "dialog",
        "data-slot": "root",
        "data-state": open ? "open" : "closed",
        "aria-modal": "true",
    };
    if (!open) {
        attributes.hidden = "";
    }
    return {
        open,
        className: styled.className,
        style: styled.style,
        attributes,
    };
}

export type ResolveCommandGroupOptions = StyleableProps<"root"> & {
    label?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export function resolveCommandGroup(options: ResolveCommandGroupOptions = {}) {
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
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "group",
            "data-slot": "group",
            ...(options.label ? { "aria-label": options.label } : {}),
        },
    };
}

export type ResolveCommandItemOptions = StyleableProps<"root"> & {
    id: string;
    selected?: boolean;
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export function resolveCommandItem(options: ResolveCommandItemOptions) {
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
        id: options.id,
        selected,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "option",
            "data-slot": "item",
            "data-state": selected ? "active" : "inactive",
            "aria-selected": selected ? "true" : "false",
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export function filterCommandPaletteCommands(
    commands: readonly CommandPaletteCommand[],
    filter: string,
): CommandPaletteCommand[] {
    const query = filter.trim().toLowerCase();
    if (!query) {
        return [...commands];
    }
    return commands.filter((command) => {
        if (command.label.toLowerCase().includes(query)) {
            return true;
        }
        return (command.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query));
    });
}

export type CreateCommandPaletteControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    filter?: string;
    defaultFilter?: string;
    onFilterChange?: (filter: string) => void;
    commands?: CommandPaletteCommand[];
    getContent: () => HTMLElement | null | undefined;
    onSelect?: (command: CommandPaletteCommand) => void;
};

export type CommandPaletteController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly value: ControllableState<string>;
    readonly filter: ControllableState<string>;
    readonly overlay: OverlayController;
    setCommands(commands: CommandPaletteCommand[]): void;
    getCommands(): CommandPaletteCommand[];
    getFilteredCommands(): CommandPaletteCommand[];
    setOpen(open: boolean): void;
    setValue(value: string): void;
    setFilter(filter: string): void;
    moveActive(delta: number): void;
    setActive(id: string): void;
    getActiveId(): string;
    selectActive(): CommandPaletteCommand | undefined;
    resolve(options?: Omit<ResolveCommandPaletteOptions, "open">): CommandPaletteViewModel;
    resolveItem(
        options: Omit<ResolveCommandItemOptions, "selected">,
    ): ReturnType<typeof resolveCommandItem>;
};

export function createCommandPaletteController(
    options: CreateCommandPaletteControllerOptions,
): CommandPaletteController {
    let commands = [...(options.commands ?? [])];
    const filter = createControllableState<string>({
        defaultValue: options.defaultFilter ?? "",
        ...(options.filter === undefined ? {} : { value: options.filter }),
        ...(options.onFilterChange === undefined ? {} : { onChange: options.onFilterChange }),
    });
    const value = createControllableState<string>({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    const ensureActiveInFiltered = (): void => {
        const filtered = filterCommandPaletteCommands(commands, filter.get()).filter(
            (command) => command.disabled !== true,
        );
        if (filtered.length === 0) {
            value.set("");
            return;
        }
        if (!filtered.some((command) => command.id === value.get())) {
            value.set(filtered[0]?.id ?? "");
        }
    };

    const overlay = createOverlayController({
        modal: true,
        getContent: options.getContent,
        ...(options.open === undefined ? {} : { open: options.open }),
        ...(options.defaultOpen === undefined ? {} : { defaultOpen: options.defaultOpen }),
        onOpenChange: (open) => {
            if (open) {
                ensureActiveInFiltered();
            }
            options.onOpenChange?.(open);
        },
    });

    ensureActiveInFiltered();

    return {
        open: overlay.open,
        value,
        filter,
        overlay,
        get disposed() {
            return overlay.disposed;
        },
        setCommands(next) {
            commands = [...next];
            ensureActiveInFiltered();
        },
        getCommands() {
            return [...commands];
        },
        getFilteredCommands() {
            return filterCommandPaletteCommands(commands, filter.get());
        },
        setOpen(next) {
            overlay.setOpen(next);
        },
        setValue(next) {
            value.set(next);
        },
        setFilter(next) {
            filter.set(next);
            ensureActiveInFiltered();
        },
        moveActive(delta) {
            const filtered = filterCommandPaletteCommands(commands, filter.get()).filter(
                (command) => command.disabled !== true,
            );
            if (filtered.length === 0) {
                return;
            }
            const currentIndex = filtered.findIndex((command) => command.id === value.get());
            const start = currentIndex >= 0 ? currentIndex : 0;
            const nextIndex =
                (((start + delta) % filtered.length) + filtered.length) % filtered.length;
            value.set(filtered[nextIndex]?.id ?? "");
        },
        setActive(id) {
            value.set(id);
        },
        getActiveId() {
            return value.get();
        },
        selectActive() {
            const filtered = filterCommandPaletteCommands(commands, filter.get());
            const active = filtered.find(
                (command) => command.id === value.get() && command.disabled !== true,
            );
            if (!active) {
                return undefined;
            }
            options.onSelect?.(active);
            overlay.setOpen(false);
            return active;
        },
        resolve(styleOptions = {}) {
            return resolveCommandPalette({
                ...styleOptions,
                open: overlay.open.get(),
            });
        },
        resolveItem(itemOptions) {
            return resolveCommandItem({
                ...itemOptions,
                selected: value.get() === itemOptions.id,
            });
        },
        dispose() {
            overlay.dispose();
        },
    };
}

export function getCommandPaletteKeyboardAction(
    event: Pick<KeyboardEvent, "key" | "isComposing">,
    options: {
        open: boolean;
    },
): "close" | "select" | "next" | "previous" | undefined {
    if (!options.open || event.isComposing === true) {
        return undefined;
    }
    if (event.key === "Escape") {
        return "close";
    }
    if (event.key === "Enter") {
        return "select";
    }
    if (event.key === "ArrowDown") {
        return "next";
    }
    if (event.key === "ArrowUp") {
        return "previous";
    }
    return undefined;
}
