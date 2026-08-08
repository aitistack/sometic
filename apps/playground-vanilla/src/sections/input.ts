import {
    bindInput,
    createFieldIds,
    createOtpInputController,
    createPasswordInputController,
    formatMasked,
    resolveField,
} from "@sometic/dom";
import { createNativeDateAdapter } from "@sometic/date-native";
import { createDateInputController } from "@sometic/dom/input-date";
import { createCurrencyInputController } from "@sometic/dom/input-currency";
import "@sometic/elements/input";

export function mountInputSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-input-status]");
    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    const fieldHost = root.querySelector<HTMLElement>("[data-field-host]");
    const ids = createFieldIds("pg");
    if (fieldHost) {
        const view = resolveField({
            ids,
            hasDescription: true,
            required: true,
        });
        while (fieldHost.firstChild) {
            fieldHost.removeChild(fieldHost.firstChild);
        }
        const label = document.createElement("label");
        label.className = "pg-field-label";
        label.textContent = "Email";
        for (const [key, value] of Object.entries(view.labelAttributes)) {
            label.setAttribute(key, value);
        }
        const description = document.createElement("p");
        description.className = "pg-field-description";
        description.textContent = "Used for account recovery.";
        for (const [key, value] of Object.entries(view.descriptionAttributes)) {
            description.setAttribute(key, value);
        }
        const fieldInput = document.createElement("input");
        fieldInput.className = "pg-input pg-input-block";
        fieldInput.dataset.fieldInput = "";
        fieldInput.type = "email";
        fieldInput.autocomplete = "email";
        fieldInput.placeholder = "you@example.com";
        for (const [key, value] of Object.entries(view.controlAttributes)) {
            fieldInput.setAttribute(key, value);
        }
        const error = document.createElement("p");
        error.className = "pg-field-error";
        error.hidden = true;
        for (const [key, value] of Object.entries(view.errorAttributes)) {
            error.setAttribute(key, value);
        }
        fieldHost.append(label, description, fieldInput, error);
    }

    const textInput = root.querySelector<HTMLInputElement>("[data-input-text]");
    let textValue = "";
    const textBinding = textInput
        ? bindInput(textInput, () => ({
              value: textValue,
              type: "text",
              placeholder: "Type here",
              classes: { root: "pg-input" },
              onValueChange: (next) => {
                  textValue = next;
                  log(`Text value=${next}`);
              },
          }))
        : undefined;

    const password = createPasswordInputController({ defaultValue: "" });
    const passwordShell = root.querySelector<HTMLElement>("[data-password-shell]");
    const passwordEl = root.querySelector<HTMLInputElement>("[data-input-password]");
    const revealBtn = root.querySelector<HTMLButtonElement>("[data-input-reveal]");
    const revealLabel = root.querySelector<HTMLElement>("[data-reveal-label]");
    const paintPassword = (): void => {
        if (!passwordEl) {
            return;
        }
        const view = password.resolve();
        const revealed = password.revealed.get();
        passwordEl.type = view.type;
        passwordEl.value = view.value;
        passwordShell?.toggleAttribute("data-revealed", revealed);
        if (revealBtn) {
            revealBtn.setAttribute("aria-pressed", revealed ? "true" : "false");
            revealBtn.setAttribute("aria-label", revealed ? "Hide password" : "Show password");
        }
        if (revealLabel) {
            revealLabel.textContent = revealed ? "Hide" : "Show";
        }
    };
    const onPasswordInput = (): void => {
        if (!passwordEl) {
            return;
        }
        password.value.set(passwordEl.value);
        log(`Password length=${password.value.get().length}`);
    };
    const onReveal = (event: Event): void => {
        event.preventDefault();
        password.toggleRevealed();
        paintPassword();
        passwordEl?.focus();
        log(`Password revealed=${String(password.revealed.get())}`);
    };
    passwordEl?.addEventListener("input", onPasswordInput);
    revealBtn?.addEventListener("click", onReveal);
    paintPassword();

    const otpLength = 6;
    const otp = createOtpInputController({ length: otpLength });
    const otpHost = root.querySelector<HTMLElement>("[data-input-otp]");
    const otpCells: HTMLInputElement[] = [];

    const paintOtp = (): void => {
        const value = otp.value.get();
        otpHost?.setAttribute("data-progress", String(value.length));
        for (let index = 0; index < otpCells.length; index += 1) {
            const cell = otpCells[index];
            if (!cell) {
                continue;
            }
            cell.value = value[index] ?? "";
            cell.dataset.filled = value[index] ? "true" : "false";
            cell.dataset.active = document.activeElement === cell ? "true" : "false";
        }
    };

    const focusOtp = (index: number): void => {
        const cell = otpCells[Math.max(0, Math.min(otpLength - 1, index))];
        cell?.focus();
        cell?.select();
    };

    const commitOtp = (nextFocus?: number): void => {
        paintOtp();
        log(`OTP=${otp.value.get()}`);
        if (nextFocus !== undefined) {
            focusOtp(nextFocus);
        }
    };

    const applyOtpText = (text: string, fromIndex = 0): void => {
        const digits = text.replace(/\D/g, "");
        if (digits.length > 1 || fromIndex === 0) {
            otp.applyPaste(digits);
            commitOtp(Math.min(Math.max(digits.length, 1) - 1, otpLength - 1));
            return;
        }
        otp.setCharAt(fromIndex, digits);
        commitOtp(digits ? Math.min(fromIndex + 1, otpLength - 1) : fromIndex);
    };

    if (otpHost) {
        otpHost.replaceChildren();
        for (let index = 0; index < otpLength; index += 1) {
            const cell = document.createElement("input");
            cell.className = "pg-otp-cell";
            cell.type = "text";
            cell.inputMode = "numeric";
            cell.pattern = "[0-9]*";
            cell.autocomplete = index === 0 ? "one-time-code" : "off";
            cell.maxLength = 1;
            cell.enterKeyHint = index === otpLength - 1 ? "done" : "next";
            cell.setAttribute("aria-label", `Digit ${index + 1} of ${otpLength}`);
            cell.dataset.index = String(index);

            cell.addEventListener("focus", () => {
                cell.select();
                paintOtp();
            });

            cell.addEventListener("click", () => {
                focusOtp(index);
            });

            cell.addEventListener("beforeinput", (event) => {
                if (event.inputType === "insertFromPaste") {
                    return;
                }
                if (event.inputType.startsWith("insert") && event.data && event.data.length > 1) {
                    event.preventDefault();
                    applyOtpText(event.data, index);
                }
            });

            cell.addEventListener("input", () => {
                const raw = cell.value;
                if (raw.length > 1) {
                    applyOtpText(raw, index);
                    return;
                }
                const digit = raw.replace(/\D/g, "").slice(-1);
                if (!digit) {
                    otp.setCharAt(index, "");
                    commitOtp(index);
                    return;
                }
                otp.setCharAt(index, digit);
                commitOtp(index < otpLength - 1 ? index + 1 : index);
            });

            cell.addEventListener("keydown", (event) => {
                if (event.key === "Backspace") {
                    if (cell.value) {
                        event.preventDefault();
                        otp.setCharAt(index, "");
                        commitOtp(index);
                        return;
                    }
                    if (index > 0) {
                        event.preventDefault();
                        otp.setCharAt(index - 1, "");
                        commitOtp(index - 1);
                    }
                    return;
                }
                if (event.key === "Delete") {
                    event.preventDefault();
                    otp.setCharAt(index, "");
                    commitOtp(index);
                    return;
                }
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    focusOtp(index - 1);
                    return;
                }
                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    focusOtp(index + 1);
                    return;
                }
                if (event.key === "Home") {
                    event.preventDefault();
                    focusOtp(0);
                    return;
                }
                if (event.key === "End") {
                    event.preventDefault();
                    focusOtp(Math.max(otp.value.get().length - 1, 0));
                    return;
                }
                if (/^\d$/.test(event.key) && cell.value) {
                    event.preventDefault();
                    otp.setCharAt(index, event.key);
                    commitOtp(index < otpLength - 1 ? index + 1 : index);
                }
            });

            cell.addEventListener("paste", (event) => {
                event.preventDefault();
                const text = event.clipboardData?.getData("text") ?? "";
                applyOtpText(text, index);
            });

            otpCells.push(cell);
            otpHost.append(cell);
        }
        paintOtp();
    }

    const maskEl = root.querySelector<HTMLInputElement>("[data-input-mask]");
    const onMask = (): void => {
        if (!maskEl) {
            return;
        }
        const next = formatMasked(
            [...maskEl.value].filter((c) => /\d/.test(c)).join(""),
            "(###) ###-####",
        );
        maskEl.value = next.display;
        log(`Masked raw=${next.raw}`);
    };
    maskEl?.addEventListener("input", onMask);

    const currency = createCurrencyInputController({ currency: "USD" });
    const currencyEl = root.querySelector<HTMLInputElement>("[data-input-currency]");
    const onCurrency = (): void => {
        if (!currencyEl) {
            return;
        }
        currency.setFromDisplay(currencyEl.value);
        currencyEl.value = currency.getDisplayValue();
        log(`Currency=${String(currency.value.get())}`);
    };
    currencyEl?.addEventListener("change", onCurrency);

    const adapter = createNativeDateAdapter();
    const date = createDateInputController({ adapter });
    const dateEl = root.querySelector<HTMLInputElement>("[data-input-date]");
    const onDate = (): void => {
        if (!dateEl) {
            return;
        }
        date.setFromNativeValue(dateEl.value);
        dateEl.value = date.resolve().value;
        log(`Date=${dateEl.value}`);
    };
    dateEl?.addEventListener("change", onDate);

    const wcInput = root.querySelector("sometic-input[data-demo='text']");
    const onWc = ((event: CustomEvent<{ value: string }>) => {
        log(`sometic-input value=${event.detail.value}`);
    }) as EventListener;
    wcInput?.addEventListener("value-change", onWc);

    const wcPassword = root.querySelector("sometic-password-input");
    const onWcPassword = ((event: CustomEvent<{ value: string }>) => {
        log(`sometic-password-input value length=${event.detail.value.length}`);
    }) as EventListener;
    wcPassword?.addEventListener("value-change", onWcPassword);

    const wcNumber = root.querySelector("sometic-number-input");
    const onWcNumber = ((event: CustomEvent<{ value: number | null }>) => {
        log(`sometic-number-input value=${String(event.detail.value)}`);
    }) as EventListener;
    wcNumber?.addEventListener("value-change", onWcNumber);

    const wcMasked = root.querySelector("sometic-masked-input");
    const onWcMasked = ((event: CustomEvent<{ value: string }>) => {
        log(`sometic-masked-input raw=${event.detail.value}`);
    }) as EventListener;
    wcMasked?.addEventListener("value-change", onWcMasked);

    const wcCurrency = root.querySelector("sometic-currency-input");
    const onWcCurrency = ((event: CustomEvent<{ value: number | null }>) => {
        log(`sometic-currency-input value=${String(event.detail.value)}`);
    }) as EventListener;
    wcCurrency?.addEventListener("value-change", onWcCurrency);

    const wcDate = root.querySelector("sometic-date-input");
    const onWcDate = ((event: CustomEvent<{ value: Date | null }>) => {
        log(`sometic-date-input value=${event.detail.value?.toISOString() ?? "null"}`);
    }) as EventListener;
    wcDate?.addEventListener("value-change", onWcDate);

    const wcFile = root.querySelector("sometic-file-input");
    const onWcFile = ((event: CustomEvent<{ files: File[] }>) => {
        log(`sometic-file-input files=${event.detail.files.map((file) => file.name).join(", ")}`);
    }) as EventListener;
    wcFile?.addEventListener("value-change", onWcFile);

    const wcOtp = root.querySelector("sometic-otp-input");
    const onWcOtp = ((event: CustomEvent<{ value: string }>) => {
        log(`sometic-otp-input value=${event.detail.value}`);
    }) as EventListener;
    wcOtp?.addEventListener("value-change", onWcOtp);

    const shadowInput = root.querySelector<HTMLElement>("sometic-input[data-demo='shadow-input']");
    if (shadowInput?.shadowRoot && !shadowInput.shadowRoot.querySelector("style[data-pg]")) {
        const style = document.createElement("style");
        style.setAttribute("data-pg", "");
        style.textContent = `
input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  background: color-mix(in srgb, currentColor 6%, transparent);
  color: inherit;
  padding: 0.55rem 0.75rem;
  font: inherit;
}
`;
        shadowInput.shadowRoot.prepend(style);
    }

    log("Input section ready · WC parity + Shadow input demo");

    return () => {
        textBinding?.dispose();
        passwordEl?.removeEventListener("input", onPasswordInput);
        revealBtn?.removeEventListener("click", onReveal);
        maskEl?.removeEventListener("input", onMask);
        currencyEl?.removeEventListener("change", onCurrency);
        dateEl?.removeEventListener("change", onDate);
        wcInput?.removeEventListener("value-change", onWc);
        wcPassword?.removeEventListener("value-change", onWcPassword);
        wcNumber?.removeEventListener("value-change", onWcNumber);
        wcMasked?.removeEventListener("value-change", onWcMasked);
        wcCurrency?.removeEventListener("value-change", onWcCurrency);
        wcDate?.removeEventListener("value-change", onWcDate);
        wcFile?.removeEventListener("value-change", onWcFile);
        wcOtp?.removeEventListener("value-change", onWcOtp);
        otpHost?.replaceChildren();
    };
}
