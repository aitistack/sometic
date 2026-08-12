import { createAccordionController } from "@sometic/dom/accordion";
import { resolveBreadcrumb, resolveBreadcrumbItem } from "@sometic/dom/breadcrumb";
import { createComboboxController } from "@sometic/dom/combobox";
import {
    createCommandPaletteController,
    getCommandPaletteKeyboardAction,
    resolveCommandItem,
    type CommandPaletteCommand,
} from "@sometic/dom/command-palette";
import { bindTabsKeyboard, createTabsController } from "@sometic/dom/tabs";
import {
    createTreeController,
    getTreeKeyboardAction,
    resolveTree,
    resolveTreeItem,
    type TreeItem,
} from "@sometic/dom/tree";
import "@sometic/elements/structure";

const STRUCTURE_COMMANDS: CommandPaletteCommand[] = [
    {
        id: "docs",
        label: "Open docs",
        keywords: ["guide", "documentation"],
        group: "Navigation",
    },
    {
        id: "status",
        label: "Focus playground status",
        keywords: ["log"],
        group: "Navigation",
    },
    {
        id: "theme",
        label: "Toggle theme",
        keywords: ["dark", "light"],
        group: "Theme",
    },
    { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
    { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
    { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
];

const STRUCTURE_TREE: TreeItem[] = [
    {
        id: "docs",
        label: "Docs",
        children: [
            {
                id: "guide",
                label: "Guide",
                children: [
                    { id: "intro", label: "Introduction" },
                    { id: "install", label: "Installation" },
                ],
            },
            {
                id: "components",
                label: "Components",
                children: [
                    { id: "tabs", label: "Tabs" },
                    { id: "tree", label: "Tree" },
                ],
            },
        ],
    },
    {
        id: "packages",
        label: "Packages",
        children: [
            { id: "dom", label: "@sometic/dom" },
            { id: "react", label: "@sometic/react", disabled: true },
        ],
    },
];

function applyAttributes(el: HTMLElement, attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    if (!("hidden" in attributes)) {
        el.removeAttribute("hidden");
    }
}

export function mountStructureSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-structure-status]");
    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    const tabsList = root.querySelector<HTMLElement>("[data-tabs-list]");
    const tabTriggers = [...root.querySelectorAll<HTMLButtonElement>("[data-tab]")];
    const tabPanels = [...root.querySelectorAll<HTMLElement>("[data-tab-panel]")];

    const syncTabs = (): void => {
        if (tabsList) {
            applyAttributes(tabsList, tabs.resolve().attributes);
        }
        for (const trigger of tabTriggers) {
            const value = trigger.dataset.tab ?? "";
            const view = tabs.resolveTrigger({ value, controls: `tab-panel-${value}` });
            applyAttributes(trigger, view.attributes);
            trigger.id = `tab-trigger-${value}`;
        }
        for (const panel of tabPanels) {
            const value = panel.dataset.tabPanel ?? "";
            const view = tabs.resolvePanel({
                value,
                labelledBy: `tab-trigger-${value}`,
            });
            applyAttributes(panel, view.attributes);
            panel.id = `tab-panel-${value}`;
            panel.hidden = !view.selected;
        }
    };

    const tabs = createTabsController({
        defaultValue: "overview",
        onValueChange: (value) => {
            syncTabs();
            log(`tabs value=${value}`);
        },
    });

    const onTabClick = (event: Event): void => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }
        const value = target.dataset.tab;
        if (value) {
            tabs.setValue(value);
        }
    };
    for (const trigger of tabTriggers) {
        trigger.addEventListener("click", onTabClick);
    }
    const tabsKeyboard = bindTabsKeyboard({
        getTabs: () =>
            tabTriggers.map((element) => ({
                value: element.dataset.tab ?? "",
                disabled: element.disabled,
                element,
            })),
        getSelected: () => tabs.value.get(),
        setSelected: (value) => tabs.setValue(value),
        getOrientation: () => tabs.orientation,
        getDir: () => tabs.dir,
    });
    syncTabs();

    const accordionRoot = root.querySelector<HTMLElement>("[data-accordion-root]");
    const accordionItems = [...root.querySelectorAll<HTMLElement>("[data-accordion-item]")];

    const syncAccordion = (): void => {
        if (accordionRoot) {
            applyAttributes(accordionRoot, accordion.resolve().attributes);
        }
        for (const item of accordionItems) {
            const value = item.dataset.accordionItem ?? "";
            const view = accordion.resolveItem({ value });
            applyAttributes(item, view.attributes);
            const trigger = item.querySelector<HTMLButtonElement>("[data-accordion-trigger]");
            const panel = item.querySelector<HTMLElement>("[data-accordion-panel]");
            if (trigger) {
                trigger.setAttribute("aria-expanded", view.open ? "true" : "false");
            }
            if (panel) {
                panel.hidden = !view.open;
            }
        }
    };

    const accordion = createAccordionController({
        type: "single",
        defaultValue: "a",
        onValueChange: (value) => {
            syncAccordion();
            log(`accordion value=${Array.isArray(value) ? value.join(",") : value}`);
        },
    });

    const onAccordionClick = (event: Event): void => {
        const button = event.currentTarget;
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        const item = button.closest<HTMLElement>("[data-accordion-item]");
        const value = item?.dataset.accordionItem;
        if (value) {
            accordion.toggle(value);
        }
    };
    for (const item of accordionItems) {
        item.querySelector<HTMLButtonElement>("[data-accordion-trigger]")?.addEventListener(
            "click",
            onAccordionClick,
        );
    }
    syncAccordion();

    const comboboxRoot = root.querySelector<HTMLElement>("[data-combobox-root]");
    const comboboxInput = root.querySelector<HTMLInputElement>("[data-combobox-input]");
    const comboboxList = root.querySelector<HTMLElement>("[data-combobox-list]");
    const comboboxOptions = [...root.querySelectorAll<HTMLElement>("[data-combobox-option]")];
    const optionLabels = new Map(
        comboboxOptions.map((option) => [
            option.dataset.comboboxOption ?? "",
            option.textContent?.trim() ?? "",
        ]),
    );

    const syncCombobox = (): void => {
        if (comboboxRoot) {
            applyAttributes(comboboxRoot, combobox.resolve().attributes);
        }
        if (comboboxList) {
            applyAttributes(comboboxList, combobox.resolveList().attributes);
        }
        const query = combobox.inputValue.get().toLowerCase();
        for (const option of comboboxOptions) {
            const value = option.dataset.comboboxOption ?? "";
            applyAttributes(option, combobox.resolveOption({ value }).attributes);
            const label = optionLabels.get(value)?.toLowerCase() ?? "";
            option.hidden = query.length > 0 && !label.includes(query);
        }
        if (comboboxInput && document.activeElement !== comboboxInput) {
            comboboxInput.value = combobox.inputValue.get();
        }
    };

    const combobox = createComboboxController({
        defaultValue: null,
        defaultOpen: false,
        defaultInputValue: "",
        onValueChange: (value) => {
            if (value) {
                combobox.setInputValue(optionLabels.get(value) ?? value);
            }
            syncCombobox();
            log(`combobox value=${String(value)}`);
        },
        onOpenChange: () => {
            syncCombobox();
        },
        onInputValueChange: () => {
            syncCombobox();
        },
    });

    const onComboboxFocus = (): void => {
        combobox.setOpen(true);
    };
    const onComboboxInput = (): void => {
        if (!comboboxInput) {
            return;
        }
        combobox.setInputValue(comboboxInput.value);
        combobox.setOpen(true);
    };
    const onComboboxOptionClick = (event: Event): void => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        combobox.setValue(target.dataset.comboboxOption ?? null);
        combobox.setOpen(false);
    };
    comboboxInput?.addEventListener("focus", onComboboxFocus);
    comboboxInput?.addEventListener("input", onComboboxInput);
    for (const option of comboboxOptions) {
        option.addEventListener("click", onComboboxOptionClick);
    }
    syncCombobox();

    const breadcrumb = root.querySelector<HTMLElement>("[data-breadcrumb]");
    if (breadcrumb) {
        applyAttributes(breadcrumb, resolveBreadcrumb().attributes);
        for (const item of breadcrumb.querySelectorAll<HTMLElement>("[data-breadcrumb-item]")) {
            const current = item.hasAttribute("data-current-page");
            applyAttributes(item, resolveBreadcrumbItem({ current }).attributes);
        }
    }

    const commandPanel = root.querySelector<HTMLElement>("[data-command-palette]");
    const commandList = root.querySelector<HTMLElement>("[data-command-list]");
    const commandFilter = root.querySelector<HTMLInputElement>("[data-command-filter]");
    const commandOpen = root.querySelector<HTMLButtonElement>("[data-command-open]");

    const syncCommand = (): void => {
        if (!commandPanel || !commandList || !commandFilter) {
            return;
        }
        const open = command.open.get();
        commandPanel.hidden = !open;
        commandFilter.value = command.filter.get();
        commandList.replaceChildren();
        const entries = command.getFilteredCommands();
        if (entries.length === 0) {
            const empty = document.createElement("p");
            empty.className = "pg-command-empty";
            empty.textContent = "No commands found";
            commandList.append(empty);
            command.overlay.sync();
            return;
        }
        let lastGroup: string | undefined;
        for (const entry of entries) {
            if (entry.group && entry.group !== lastGroup) {
                const heading = document.createElement("div");
                heading.className = "pg-command-group";
                heading.textContent = entry.group;
                commandList.append(heading);
                lastGroup = entry.group;
            }
            const view = resolveCommandItem({
                id: entry.id,
                selected: command.getActiveId() === entry.id,
                ...(entry.disabled === undefined ? {} : { disabled: entry.disabled }),
            });
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = entry.label;
            button.className = "pg-command-item";
            applyAttributes(button, view.attributes);
            button.disabled = entry.disabled === true;
            button.addEventListener("click", () => {
                command.setActive(entry.id);
                command.selectActive();
            });
            commandList.append(button);
        }
        command.overlay.sync();
    };

    const command = createCommandPaletteController({
        defaultOpen: false,
        commands: STRUCTURE_COMMANDS,
        getContent: () => commandPanel,
        onOpenChange: () => {
            syncCommand();
            log(`command open=${String(command.open.get())}`);
        },
        onFilterChange: () => syncCommand(),
        onValueChange: () => syncCommand(),
        onSelect: (entry) => log(`command select=${entry.id}`),
    });

    const onCommandOpen = (): void => {
        command.setOpen(true);
        commandFilter?.focus();
    };
    const onCommandFilter = (): void => {
        if (!commandFilter) {
            return;
        }
        command.setFilter(commandFilter.value);
    };
    const onCommandKeyDown = (event: KeyboardEvent): void => {
        const action = getCommandPaletteKeyboardAction(event, { open: command.open.get() });
        if (!action) {
            return;
        }
        event.preventDefault();
        if (action === "close") {
            command.setOpen(false);
        } else if (action === "next") {
            command.moveActive(1);
            syncCommand();
        } else if (action === "previous") {
            command.moveActive(-1);
            syncCommand();
        } else if (action === "select") {
            command.selectActive();
        }
    };
    commandOpen?.addEventListener("click", onCommandOpen);
    commandFilter?.addEventListener("input", onCommandFilter);
    commandPanel?.addEventListener("keydown", onCommandKeyDown);
    syncCommand();

    const treeRoot = root.querySelector<HTMLElement>("[data-tree-root]");
    const tree = createTreeController({
        items: STRUCTURE_TREE,
        defaultValue: "tree",
        defaultExpanded: ["docs", "guide", "components"],
        onValueChange: (value) => {
            syncTree();
            log(`tree value=${value}`);
        },
        onExpandedChange: () => syncTree(),
    });

    const syncTree = (): void => {
        if (!treeRoot) {
            return;
        }
        applyAttributes(treeRoot, resolveTree().attributes);
        treeRoot.replaceChildren();
        for (const node of tree.getVisibleNodes()) {
            const view = resolveTreeItem({
                id: node.item.id,
                level: node.level,
                hasChildren: node.hasChildren,
                selected: tree.isSelected(node.item.id),
                expanded: tree.isExpanded(node.item.id),
                ...(node.item.disabled === undefined ? {} : { disabled: node.item.disabled }),
            });
            const row = document.createElement("button");
            row.type = "button";
            row.className = "pg-tree-item";
            row.textContent = node.item.label;
            applyAttributes(row, view.attributes);
            row.style.setProperty("--pg-tree-level", String(node.level));
            row.disabled = node.item.disabled === true;
            row.addEventListener("click", () => {
                if (node.item.disabled === true) {
                    return;
                }
                tree.setValue(node.item.id);
                if (node.hasChildren) {
                    tree.toggleExpanded(node.item.id);
                }
            });
            treeRoot.append(row);
        }
    };

    const onTreeKeyDown = (event: KeyboardEvent): void => {
        const action = getTreeKeyboardAction(event, {
            nodes: tree.getVisibleNodes(),
            selected: tree.value.get(),
            expanded: new Set(tree.expanded.get()),
            dir: tree.dir,
        });
        if (!action) {
            return;
        }
        event.preventDefault();
        if (action.expand) {
            tree.expand(action.expand);
        }
        if (action.collapse) {
            tree.collapse(action.collapse);
        }
        if (action.select) {
            tree.setValue(action.select);
        }
        syncTree();
    };
    treeRoot?.addEventListener("keydown", onTreeKeyDown);
    syncTree();

    const progress = root.querySelector<HTMLElement>("sometic-progress");
    const bump = root.querySelector<HTMLButtonElement>("[data-progress-bump]");
    const syncProgressBar = (value: number): void => {
        if (!progress) {
            return;
        }
        const max = Number(progress.getAttribute("max") ?? "100");
        const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
        progress.style.setProperty("--pg-progress-pct", `${String(pct)}%`);
    };
    if (progress) {
        syncProgressBar(Number(progress.getAttribute("value") ?? "0"));
    }
    const onBump = (): void => {
        if (!progress) {
            return;
        }
        const current = Number(progress.getAttribute("value") ?? "0");
        const next = current >= 100 ? 10 : current + 15;
        progress.setAttribute("value", String(next));
        syncProgressBar(next);
        log(`progress value=${String(next)}`);
    };
    bump?.addEventListener("click", onBump);

    log("Structure ready · tabs / accordion / command / tree / breadcrumb + feedback CEs");

    return () => {
        tabsKeyboard.dispose();
        for (const trigger of tabTriggers) {
            trigger.removeEventListener("click", onTabClick);
        }
        for (const item of accordionItems) {
            item.querySelector<HTMLButtonElement>("[data-accordion-trigger]")?.removeEventListener(
                "click",
                onAccordionClick,
            );
        }
        comboboxInput?.removeEventListener("focus", onComboboxFocus);
        comboboxInput?.removeEventListener("input", onComboboxInput);
        for (const option of comboboxOptions) {
            option.removeEventListener("click", onComboboxOptionClick);
        }
        commandOpen?.removeEventListener("click", onCommandOpen);
        commandFilter?.removeEventListener("input", onCommandFilter);
        commandPanel?.removeEventListener("keydown", onCommandKeyDown);
        command.dispose();
        treeRoot?.removeEventListener("keydown", onTreeKeyDown);
        bump?.removeEventListener("click", onBump);
    };
}
