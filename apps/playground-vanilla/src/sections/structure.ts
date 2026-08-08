import { createAccordionController } from "@sometic/dom/accordion";
import { resolveBreadcrumb, resolveBreadcrumbItem } from "@sometic/dom/breadcrumb";
import { createComboboxController } from "@sometic/dom/combobox";
import { createTabsController } from "@sometic/dom/tabs";
import "@sometic/elements/structure";

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

    log("Structure ready · tabs / accordion / combobox / breadcrumb + feedback CEs");

    return () => {
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
        bump?.removeEventListener("click", onBump);
    };
}
