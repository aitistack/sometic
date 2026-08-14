import { createForm, type FieldRegistrationOptions } from "@sometic/forms";
import {
    createDataTableController,
    resolveDataTable,
    resolveDataTableCell,
    resolveDataTableHeader,
    resolveDataTableRow,
} from "@sometic/dom/data-table";
import { registerButtonElements } from "@sometic/elements/button";
import { applyThemeToElement } from "@sometic/theme";
import { email, required } from "@sometic/validation";
import {
    createInvoiceDeskRuntime,
    emptyInvoiceFormValues,
    INVOICE_DESK_PASSWORD,
    INVOICE_DESK_USERS,
    INVOICE_NOTES_FLAG,
    invoiceAmountValidators,
    invoiceCustomerValidators,
    invoiceStatusValidators,
    invoiceToFormValues,
    parseInvoiceStatus,
    type Invoice,
    type InvoiceFormValues,
} from "@sometic/example-invoice-kit";
import "./desk.css";

registerButtonElements();

const runtime = createInvoiceDeskRuntime();
const theme = runtime.app.theme;
if (theme) {
    theme.setMode("light");
    applyThemeToElement(document.documentElement, theme.get());
    theme.subscribe((snapshot) => {
        applyThemeToElement(document.documentElement, snapshot);
    });
}

window.addEventListener("pagehide", () => {
    table.dispose();
    runtime.dispose();
});

const mountedRoot = document.getElementById("app");
if (!(mountedRoot instanceof HTMLElement)) {
    throw new Error("Invoice Desk root is missing");
}
const root = mountedRoot;

const loginForm = createForm({
    defaultValues: { email: "", password: "" },
});
const editorForm = createForm<InvoiceFormValues>({
    defaultValues: emptyInvoiceFormValues(),
});
editorForm.subscribe(() => {
    runtime.editorValues.current = editorForm.getValues();
    void runtime.drafts.scheduleSave();
});

const table = createDataTableController<Invoice>({
    columns: [
        { id: "number", header: "Number", accessor: (row) => row.number, sortable: true },
        { id: "customer", header: "Customer", accessor: (row) => row.customer, sortable: true },
        { id: "amount", header: "Amount", accessor: (row) => row.amount, sortable: true },
        { id: "status", header: "Status", accessor: (row) => row.status, sortable: true },
    ],
    getRowId: (row) => row.id,
    rows: [],
    defaultPagination: { pageIndex: 0, pageSize: 10 },
});

let editingId: string | null = null;
const fieldUnsubscribers: Array<() => void> = [];

function formatInvoiceAmount(amount: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function statusBadgeClass(status: string): string {
    if (status === "paid") {
        return "badge text-bg-success";
    }
    if (status === "sent") {
        return "badge text-bg-info";
    }
    return "badge text-bg-warning";
}

function paintSometicButtons(scope: ParentNode): void {
    for (const host of scope.querySelectorAll("sometic-button")) {
        const className = host.getAttribute("data-bs-class");
        const inner = host.querySelector("button");
        if (className && inner instanceof HTMLButtonElement) {
            inner.className = className;
        }
    }
}

function someticButton(
    label: string,
    className: string,
    type: "button" | "submit" = "button",
): HTMLElement {
    const host = document.createElement("sometic-button");
    host.setAttribute("type", type);
    host.setAttribute("data-bs-class", className);
    host.textContent = label;
    return host;
}

function field(label: string, control: HTMLElement, errorText = ""): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "mb-3";
    const labelEl = document.createElement("label");
    const controlId = control.id || `${label.toLowerCase().replace(/\s+/g, "-")}-field`;
    control.id = controlId;
    labelEl.htmlFor = controlId;
    labelEl.className = "form-label";
    labelEl.textContent = label;
    wrap.append(labelEl, control);
    if (errorText) {
        const error = document.createElement("div");
        error.className = "invalid-feedback d-block";
        error.textContent = errorText;
        wrap.append(error);
    }
    return wrap;
}

function bindTextInput(
    input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    name: string,
    form: {
        register: (fieldName: string, options?: FieldRegistrationOptions) => void;
        getValue: (fieldName: string) => unknown;
        setValue: (fieldName: string, value: unknown) => void;
        setTouched: (fieldName: string, touched?: boolean) => void;
        validateField: (fieldName: string) => Promise<boolean>;
        subscribe: (listener: () => void) => () => void;
    },
    validators?: FieldRegistrationOptions,
): void {
    form.register(name, validators);
    input.value = String(form.getValue(name) ?? "");
    input.addEventListener("input", () => {
        form.setValue(name, input.value);
    });
    input.addEventListener("blur", () => {
        form.setTouched(name, true);
        void form.validateField(name);
    });
    fieldUnsubscribers.push(
        form.subscribe(() => {
            const next = String(form.getValue(name) ?? "");
            if (input.value !== next) {
                input.value = next;
            }
        }),
    );
}

function clearFieldSubscriptions(): void {
    while (fieldUnsubscribers.length > 0) {
        fieldUnsubscribers.pop()?.();
    }
}

type InvoiceListObserver = {
    subscribe: (listener: () => void) => () => void;
    getCurrentResult: () => { data: Invoice[] | undefined };
    refetch: () => Promise<unknown>;
    destroy: () => void;
};

let invoicesObserver: InvoiceListObserver | undefined;

async function refreshInvoices(): Promise<void> {
    if (runtime.auth.getSession().status !== "authenticated") {
        table.setRows([]);
        return;
    }
    if (!invoicesObserver) {
        const observer = runtime.app.query.define(["invoices"], async () => {
            const response = await runtime.app.http.get<Invoice[]>("/invoices");
            return response.data;
        });
        invoicesObserver = observer;
        observer.subscribe(() => {
            table.setRows(observer.getCurrentResult().data ?? []);
        });
    }
    const activeObserver = invoicesObserver;
    if (activeObserver === undefined) {
        return;
    }
    await activeObserver.refetch();
}

function renderTable(host: HTMLElement): void {
    const state = table.getState();
    const pageRows = table.getPageRows();
    const view = resolveDataTable({
        busy: state.loading,
        rowCount: pageRows.length,
        columnCount: table.getVisibleColumns().length,
        mode: state.mode,
        label: "Invoices",
        interactive: true,
    });
    host.replaceChildren();
    host.className = ["desk-table-host table-responsive", view.className].filter(Boolean).join(" ");
    for (const [key, value] of Object.entries(view.attributes)) {
        host.setAttribute(key, value);
    }
    const tableEl = document.createElement("table");
    tableEl.className = "table table-hover align-middle mb-0";
    const thead = document.createElement("thead");
    thead.className = "table-light";
    const headRow = document.createElement("tr");
    for (const column of table.getVisibleColumns()) {
        const th = document.createElement("th");
        const sort = state.sorting.find((item) => item.id === column.id);
        const header = resolveDataTableHeader({
            columnId: column.id,
            sortable: column.sortable === true,
            sortDirection: sort?.direction ?? null,
        });
        for (const [key, value] of Object.entries(header.attributes)) {
            th.setAttribute(key, value);
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-link btn-sm link-dark text-decoration-none px-0";
        button.textContent = `${column.header ?? column.id}${
            sort?.direction === "asc" ? " ↑" : sort?.direction === "desc" ? " ↓" : ""
        }`;
        button.addEventListener("click", () => {
            table.toggleSort(column.id);
        });
        th.append(button);
        headRow.append(th);
    }
    thead.append(headRow);
    const tbody = document.createElement("tbody");
    if (pageRows.length === 0) {
        const empty = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = table.getVisibleColumns().length;
        cell.className = "text-center text-secondary py-4";
        cell.textContent = "No invoices";
        empty.append(cell);
        tbody.append(empty);
    } else {
        for (const [rowIndex, row] of pageRows.entries()) {
            const tr = document.createElement("tr");
            const rowView = resolveDataTableRow({
                rowId: row.id,
                rowIndex,
                selected: editingId === row.id,
            });
            for (const [key, value] of Object.entries(rowView.attributes)) {
                tr.setAttribute(key, value);
            }
            if (editingId === row.id) {
                tr.classList.add("table-active");
            }
            tr.addEventListener("click", () => {
                editingId = row.id;
                editorForm.reset(invoiceToFormValues(row));
                runtime.editorValues.current = invoiceToFormValues(row);
                render();
            });
            for (const column of table.getVisibleColumns()) {
                const td = document.createElement("td");
                const cell = resolveDataTableCell({ columnId: column.id, columnIndex: 0 });
                for (const [key, value] of Object.entries(cell.attributes)) {
                    td.setAttribute(key, value);
                }
                if (column.id === "amount") {
                    td.textContent = formatInvoiceAmount(row.amount);
                } else if (column.id === "status") {
                    const badge = document.createElement("span");
                    badge.className = statusBadgeClass(row.status);
                    badge.textContent = row.status;
                    td.append(badge);
                } else {
                    td.textContent = String(column.accessor?.(row) ?? "");
                }
                tr.append(td);
            }
            tbody.append(tr);
        }
    }
    tableEl.append(thead, tbody);
    host.append(tableEl);

    const pager = document.createElement("div");
    pager.className = "d-flex flex-wrap gap-2 align-items-center mt-3";
    pager.setAttribute("data-slot", "pagination");
    const pageButtons: Array<{ label: string; disabled: boolean; onClick: () => void }> = [
        {
            label: "First",
            disabled: state.pagination.pageIndex === 0,
            onClick: () => {
                table.setPageIndex(0);
            },
        },
        {
            label: "Previous",
            disabled: state.pagination.pageIndex === 0,
            onClick: () => {
                table.setPageIndex(state.pagination.pageIndex - 1);
            },
        },
        {
            label: "Next",
            disabled: state.pageCount === 0 || state.pagination.pageIndex >= state.pageCount - 1,
            onClick: () => {
                table.setPageIndex(state.pagination.pageIndex + 1);
            },
        },
        {
            label: "Last",
            disabled: state.pageCount === 0 || state.pagination.pageIndex >= state.pageCount - 1,
            onClick: () => {
                table.setPageIndex(state.pageCount - 1);
            },
        },
    ];
    for (const item of pageButtons) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-outline-secondary btn-sm";
        button.textContent = item.label;
        button.disabled = item.disabled;
        button.addEventListener("click", item.onClick);
        pager.append(button);
    }
    const status = document.createElement("span");
    status.className = "text-secondary small";
    status.textContent = `Page ${state.pagination.pageIndex + 1} of ${Math.max(state.pageCount, 1)}`;
    const size = document.createElement("select");
    size.className = "form-select form-select-sm w-auto";
    for (const value of [5, 8, 10, 25]) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value);
        option.selected = state.pagination.pageSize === value;
        size.append(option);
    }
    size.addEventListener("change", () => {
        table.setPageSize(Number(size.value));
    });
    pager.append(status, size);
    host.append(pager);
}

function render(): void {
    const session = runtime.auth.getSession();
    clearFieldSubscriptions();
    root.replaceChildren();
    const shell = document.createElement("main");
    shell.className = "container py-4 py-lg-5";

    if (session.status !== "authenticated") {
        shell.className =
            "container d-flex min-vh-100 align-items-center justify-content-center py-5";
        const hero = document.createElement("div");
        hero.className = "desk-hero w-100";
        const kicker = document.createElement("p");
        kicker.className = "badge text-bg-primary rounded-pill mb-3";
        kicker.textContent = "Vanilla · Bootstrap";
        const title = document.createElement("h1");
        title.className = "h2 fw-semibold mb-2";
        title.textContent = "Invoice Desk";
        const blurb = document.createElement("p");
        blurb.className = "text-secondary mb-4";
        blurb.textContent =
            "Same Sometic engines as React and Vue. This app styles sometic-button and the Light DOM data table with Bootstrap.";
        const accounts = document.createElement("div");
        accounts.className = "row g-2 mb-2";
        for (const account of INVOICE_DESK_USERS) {
            const col = document.createElement("div");
            col.className = "col-sm-6";
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "btn btn-outline-primary w-100 text-start";
            const name = document.createElement("strong");
            name.className = "d-block";
            name.textContent = account.user.displayName;
            const mail = document.createElement("span");
            mail.className = "small";
            mail.textContent = account.email;
            chip.append(name, mail);
            chip.addEventListener("click", () => {
                loginForm.setValue("email", account.email);
                loginForm.setValue("password", INVOICE_DESK_PASSWORD);
            });
            col.append(chip);
            accounts.append(col);
        }
        const hint = document.createElement("p");
        hint.className = "small text-secondary mb-3";
        hint.textContent = `Password for both accounts: ${INVOICE_DESK_PASSWORD}`;
        const card = document.createElement("div");
        card.className = "card shadow-sm border-0";
        const cardBody = document.createElement("div");
        cardBody.className = "card-body p-4";
        const formEl = document.createElement("form");
        formEl.noValidate = true;
        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.className = "form-control";
        emailInput.autocomplete = "username";
        emailInput.required = true;
        bindTextInput(emailInput, "email", loginForm, {
            validators: [required("Email is required"), email()],
        });
        const passwordInput = document.createElement("input");
        passwordInput.type = "password";
        passwordInput.name = "password";
        passwordInput.className = "form-control";
        passwordInput.autocomplete = "current-password";
        passwordInput.required = true;
        bindTextInput(passwordInput, "password", loginForm, {
            validators: [required("Password is required")],
        });
        const error = document.createElement("p");
        error.className = "alert alert-danger py-2";
        error.setAttribute("role", "alert");
        error.hidden = true;
        const submit = someticButton("Sign in", "btn btn-primary w-100", "submit");
        submit.addEventListener("click", () => {
            formEl.requestSubmit();
        });
        formEl.append(field("Email", emailInput), field("Password", passwordInput), error, submit);
        formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            void loginForm.handleSubmit({
                onValid: async (values) => {
                    error.hidden = true;
                    try {
                        await runtime.auth.signIn({
                            email: String(values["email"] ?? ""),
                            password: String(values["password"] ?? ""),
                        });
                        await refreshInvoices();
                        render();
                    } catch {
                        error.hidden = false;
                        error.textContent = "Invalid email or password";
                        emailInput.focus();
                    }
                },
                onInvalid: () => {
                    emailInput.focus();
                },
            })();
        });
        cardBody.append(formEl);
        card.append(cardBody);
        hero.append(kicker, title, blurb, accounts, hint, card);
        shell.append(hero);
        root.append(shell);
        paintSometicButtons(root);
        return;
    }

    const header = document.createElement("header");
    header.className =
        "d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-white border rounded-3 shadow-sm";
    const identity = document.createElement("div");
    const kicker = document.createElement("p");
    kicker.className = "badge text-bg-primary rounded-pill mb-2";
    kicker.textContent = "Vanilla · Bootstrap";
    const title = document.createElement("h1");
    title.className = "h3 mb-1";
    title.textContent = "Invoice Desk";
    const who = document.createElement("p");
    who.className = "text-secondary mb-0";
    who.textContent = session.user?.displayName ?? session.user?.email ?? "Signed in";
    identity.append(kicker, title, who);
    const actions = document.createElement("div");
    actions.className = "d-flex flex-wrap align-items-center gap-3";
    const notesSwitch = document.createElement("div");
    notesSwitch.className = "form-check form-switch mb-0";
    const notesToggle = document.createElement("input");
    notesToggle.type = "checkbox";
    notesToggle.className = "form-check-input";
    notesToggle.id = "show-notes";
    notesToggle.checked = runtime.flags.isEnabled(INVOICE_NOTES_FLAG);
    notesToggle.addEventListener("change", () => {
        runtime.flags.setOverride(
            INVOICE_NOTES_FLAG,
            notesToggle.checked ? null : { enabled: false },
        );
        render();
    });
    const notesLabel = document.createElement("label");
    notesLabel.className = "form-check-label";
    notesLabel.htmlFor = "show-notes";
    notesLabel.textContent = "Show notes";
    notesSwitch.append(notesToggle, notesLabel);
    const signOut = someticButton("Sign out", "btn btn-outline-secondary btn-sm");
    signOut.addEventListener("click", () => {
        void runtime.auth.signOut().then(() => {
            invoicesObserver?.destroy();
            invoicesObserver = undefined;
            table.setRows([]);
            editingId = null;
            render();
        });
    });
    actions.append(notesSwitch, signOut);
    header.append(identity, actions);

    const grid = document.createElement("div");
    grid.className = "row g-4";
    const listCol = document.createElement("div");
    listCol.className = "col-lg-7";
    const listCard = document.createElement("section");
    listCard.className = "card shadow-sm border-0 h-100";
    listCard.setAttribute("aria-labelledby", "invoice-list-heading");
    const listBody = document.createElement("div");
    listBody.className = "card-body p-4";
    const listHeader = document.createElement("div");
    listHeader.className = "d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3";
    const listHeadingBlock = document.createElement("div");
    const listHeading = document.createElement("h2");
    listHeading.id = "invoice-list-heading";
    listHeading.className = "h5 mb-1";
    listHeading.textContent = "Invoices";
    const listHint = document.createElement("p");
    listHint.className = "text-secondary small mb-0";
    listHint.textContent = "Click a row to edit.";
    listHeadingBlock.append(listHeading, listHint);
    const newButton = someticButton("New invoice", "btn btn-outline-primary btn-sm");
    newButton.addEventListener("click", () => {
        editingId = null;
        editorForm.reset(emptyInvoiceFormValues());
        runtime.editorValues.current = emptyInvoiceFormValues();
        render();
    });
    listHeader.append(listHeadingBlock, newButton);
    const tableHost = document.createElement("div");
    renderTable(tableHost);
    listBody.append(listHeader, tableHost);
    listCard.append(listBody);
    listCol.append(listCard);

    const editorCol = document.createElement("div");
    editorCol.className = "col-lg-5";
    const editorCard = document.createElement("section");
    editorCard.className = "card shadow-sm border-0 desk-editor";
    editorCard.setAttribute("aria-labelledby", "invoice-editor-heading");
    const editorBody = document.createElement("div");
    editorBody.className = "card-body p-4";
    const editorHeading = document.createElement("h2");
    editorHeading.id = "invoice-editor-heading";
    editorHeading.className = "h5 mb-3";
    editorHeading.textContent = editingId ? "Edit invoice" : "New invoice";
    const formEl = document.createElement("form");
    formEl.noValidate = true;
    const customerInput = document.createElement("input");
    customerInput.name = "customer";
    customerInput.className = "form-control";
    customerInput.required = true;
    bindTextInput(customerInput, "customer", editorForm, {
        validators: invoiceCustomerValidators,
    });
    const amountInput = document.createElement("input");
    amountInput.name = "amount";
    amountInput.className = "form-control";
    amountInput.inputMode = "decimal";
    amountInput.required = true;
    bindTextInput(amountInput, "amount", editorForm, {
        validators: invoiceAmountValidators,
    });
    const statusInput = document.createElement("select");
    statusInput.name = "status";
    statusInput.className = "form-select";
    statusInput.required = true;
    for (const value of ["draft", "sent", "paid"] as const) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        statusInput.append(option);
    }
    bindTextInput(statusInput, "status", editorForm, {
        validators: invoiceStatusValidators,
    });
    formEl.append(
        field("Customer", customerInput),
        field("Amount", amountInput),
        field("Status", statusInput),
    );
    if (runtime.flags.isEnabled(INVOICE_NOTES_FLAG)) {
        const notesInput = document.createElement("input");
        notesInput.name = "notes";
        notesInput.className = "form-control";
        bindTextInput(notesInput, "notes", editorForm);
        formEl.append(field("Notes", notesInput));
    }
    const saveError = document.createElement("p");
    saveError.className = "alert alert-danger py-2";
    saveError.setAttribute("role", "alert");
    saveError.hidden = true;
    const save = someticButton("Save", "btn btn-primary", "submit");
    save.addEventListener("click", () => {
        formEl.requestSubmit();
    });
    formEl.append(saveError, save);
    let persistInFlight = false;
    formEl.addEventListener("submit", (event) => {
        event.preventDefault();
        if (persistInFlight) {
            return;
        }
        persistInFlight = true;
        void editorForm
            .handleSubmit({
                onValid: async (values) => {
                    const parsedStatus = parseInvoiceStatus(values.status);
                    if (parsedStatus === null) {
                        return;
                    }
                    saveError.hidden = true;
                    try {
                        const payload = JSON.stringify({
                            customer: values.customer,
                            amount: Number(values.amount),
                            status: parsedStatus,
                            notes: values.notes,
                        });
                        const headers = { "Content-Type": "application/json" };
                        if (editingId) {
                            await runtime.app.http.put(`/invoices/${editingId}`, payload, {
                                headers,
                            });
                        } else {
                            await runtime.app.http.post("/invoices", payload, { headers });
                        }
                        await runtime.app.query.invalidate(["invoices"]);
                        editorForm.reset(emptyInvoiceFormValues());
                        runtime.editorValues.current = emptyInvoiceFormValues();
                        editingId = null;
                        await refreshInvoices();
                        render();
                    } catch {
                        saveError.hidden = false;
                        saveError.textContent = "Could not save the invoice.";
                        customerInput.focus();
                    }
                },
                onInvalid: () => {
                    customerInput.focus();
                },
            })()
            .finally(() => {
                persistInFlight = false;
            });
    });
    editorBody.append(editorHeading, formEl);
    editorCard.append(editorBody);
    editorCol.append(editorCard);
    grid.append(listCol, editorCol);
    shell.append(header, grid);
    root.append(shell);
    paintSometicButtons(root);
}

table.subscribe(() => {
    const host = root.querySelector(".desk-table-host");
    if (host instanceof HTMLElement) {
        renderTable(host);
    }
});

runtime.auth.subscribe(() => {
    void refreshInvoices().then(() => {
        render();
    });
});

render();
