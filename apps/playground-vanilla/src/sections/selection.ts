import { bindCheckbox } from "@sometic/dom/checkbox";
import { createRadioGroupController } from "@sometic/dom/radio";
import { bindSelect } from "@sometic/dom/select";
import { createSwitchController, resolveSwitch } from "@sometic/dom/switch";
import "@sometic/elements/selection";

export function mountSelectionSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-selection-status]");
    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    const checkbox = root.querySelector<HTMLInputElement>("[data-selection-checkbox]");
    const checkboxBinding = checkbox
        ? bindCheckbox(checkbox, () => ({
              checked: checkbox.checked,
              onCheckedChange: (checked) => {
                  log(`checkbox checked=${String(checked)}`);
              },
          }))
        : undefined;

    const switchEl = root.querySelector<HTMLInputElement>("[data-selection-switch]");
    const switchController = createSwitchController({
        onCheckedChange: (checked) => {
            log(`switch checked=${String(checked)}`);
            if (switchEl) {
                const view = resolveSwitch({ checked });
                switchEl.checked = view.checked;
                for (const [key, value] of Object.entries(view.attributes)) {
                    switchEl.setAttribute(key, value);
                }
            }
        },
    });
    const onSwitch = (): void => {
        if (!switchEl) {
            return;
        }
        switchController.setChecked(switchEl.checked);
    };
    switchEl?.addEventListener("change", onSwitch);

    const radioGroup = createRadioGroupController({
        name: "plan",
        defaultValue: "pro",
        onValueChange: (value) => {
            log(`radio value=${String(value)}`);
            for (const input of root.querySelectorAll<HTMLInputElement>(
                'input[type="radio"][name="plan"]',
            )) {
                input.checked = input.value === value;
            }
        },
    });
    const onRadio = (event: Event): void => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.name === "plan") {
            radioGroup.setValue(target.value);
        }
    };
    root.addEventListener("change", onRadio);

    const selectEl = root.querySelector<HTMLSelectElement>("[data-selection-select]");
    const selectBinding = selectEl
        ? bindSelect(selectEl, () => ({
              value: selectEl.value || null,
              options: [
                  { value: "us", label: "United States" },
                  { value: "ca", label: "Canada" },
                  { value: "uk", label: "United Kingdom" },
              ],
              onValueChange: (value) => {
                  log(`select value=${String(value)}`);
              },
          }))
        : undefined;

    const wcCheckbox = root.querySelector("sometic-checkbox");
    const onWcCheckbox = ((event: CustomEvent<{ checked: boolean }>) => {
        log(`sometic-checkbox checked=${String(event.detail.checked)}`);
    }) as EventListener;
    wcCheckbox?.addEventListener("checked-change", onWcCheckbox);

    const wcSwitch = root.querySelector("sometic-switch");
    const onWcSwitch = ((event: CustomEvent<{ checked: boolean }>) => {
        log(`sometic-switch checked=${String(event.detail.checked)}`);
    }) as EventListener;
    wcSwitch?.addEventListener("checked-change", onWcSwitch);

    log("Selection ready · checkbox / switch / radio / select + WC");

    return () => {
        checkboxBinding?.dispose();
        selectBinding?.dispose();
        switchEl?.removeEventListener("change", onSwitch);
        root.removeEventListener("change", onRadio);
        wcCheckbox?.removeEventListener("checked-change", onWcCheckbox);
        wcSwitch?.removeEventListener("checked-change", onWcSwitch);
    };
}
