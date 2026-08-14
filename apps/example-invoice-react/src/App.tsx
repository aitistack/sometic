import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthProvider, useSession } from "@sometic/react/auth";
import { Button } from "@sometic/react/button";
import { DataTable } from "@sometic/react/data";
import { Field } from "@sometic/react/field";
import { Form, useForm, useFormField } from "@sometic/react/form";
import { Input } from "@sometic/react/input";
import { QueryClientProvider, useMutation, useQuery } from "@sometic/react/query";
import { Select, Switch } from "@sometic/react/selection";
import { createFieldIds } from "@sometic/dom/field";
import { email, required } from "@sometic/validation";
import {
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
    type InvoiceDeskRuntime,
    type InvoiceFormValues,
} from "@sometic/example-invoice-kit";
import {
    buttonPrimaryClassName,
    buttonQuietClassName,
    buttonSecondaryClassName,
    fieldClasses,
    formatInvoiceAmount,
    inputClassName,
    invoiceStatusBadgeClass,
    invoiceStatusOptions,
    selectClassName,
    switchClassName,
} from "./ui.js";

const emptyInvoiceRows: Invoice[] = [];

function toRecordForm(controller: {
    register: (name: string) => void;
}): NonNullable<Parameters<typeof useFormField>[2]> {
    return controller as NonNullable<Parameters<typeof useFormField>[2]>;
}

export function App(props: { runtime: InvoiceDeskRuntime }) {
    return (
        <AuthProvider auth={props.runtime.auth}>
            <QueryClientProvider client={props.runtime.app.query}>
                <Shell runtime={props.runtime} />
            </QueryClientProvider>
        </AuthProvider>
    );
}

function Shell(props: { runtime: InvoiceDeskRuntime }) {
    const session = useSession(props.runtime.auth);
    if (session.status !== "authenticated") {
        return <Login runtime={props.runtime} />;
    }
    return <Desk runtime={props.runtime} />;
}

function Login(props: { runtime: InvoiceDeskRuntime }) {
    const form = useForm({
        defaultValues: { email: "", password: "" },
    });
    const emailField = useFormField(
        "email",
        { validators: [required("Email is required"), email()] },
        toRecordForm(form),
    );
    const passwordField = useFormField(
        "password",
        { validators: [required("Password is required")] },
        toRecordForm(form),
    );
    const emailIds = useMemo(() => createFieldIds("email"), []);
    const passwordIds = useMemo(() => createFieldIds("password"), []);
    const [error, setError] = useState("");

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
                    React · Tailwind CSS
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Invoice Desk
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Same Sometic engines as Vue and Vanilla. This app styles unstyled Field, Input,
                    Button, Select, and DataTable slots with Tailwind utilities.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {INVOICE_DESK_USERS.map((account) => (
                        <button
                            key={account.email}
                            type="button"
                            className="rounded-xl border border-indigo-100 bg-white px-3 py-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow"
                            onClick={() => {
                                emailField.setValue(account.email);
                                passwordField.setValue(INVOICE_DESK_PASSWORD);
                            }}
                        >
                            <span className="block text-sm font-semibold text-slate-900">
                                {account.user.displayName}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {account.email}
                            </span>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    Password for both accounts: {INVOICE_DESK_PASSWORD}
                </p>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                    <Form
                        form={toRecordForm(form)}
                        className="flex flex-col gap-4"
                        onValid={async (values) => {
                            setError("");
                            try {
                                await props.runtime.auth.signIn({
                                    email: String(values["email"] ?? ""),
                                    password: String(values["password"] ?? ""),
                                });
                            } catch {
                                setError("Invalid email or password");
                                document.getElementById(emailIds.id)?.focus();
                            }
                        }}
                        onInvalid={() => {
                            document.getElementById(emailIds.id)?.focus();
                        }}
                    >
                        <Field
                            ids={emailIds}
                            label="Email"
                            required
                            invalid={emailField.meta.invalid}
                            error={emailField.meta.error}
                            classes={fieldClasses}
                        >
                            <Input
                                id={emailIds.id}
                                name="email"
                                type="email"
                                autoComplete="username"
                                value={String(emailField.value ?? "")}
                                onValueChange={emailField.setValue}
                                onBlur={emailField.onBlur}
                                required
                                invalid={emailField.meta.invalid}
                                classes={{ root: inputClassName }}
                            />
                        </Field>
                        <Field
                            ids={passwordIds}
                            label="Password"
                            required
                            invalid={passwordField.meta.invalid}
                            error={passwordField.meta.error}
                            classes={fieldClasses}
                        >
                            <Input
                                id={passwordIds.id}
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={String(passwordField.value ?? "")}
                                onValueChange={passwordField.setValue}
                                onBlur={passwordField.onBlur}
                                required
                                invalid={passwordField.meta.invalid}
                                classes={{ root: inputClassName }}
                            />
                        </Field>
                        {error ? (
                            <p
                                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
                                role="alert"
                            >
                                {error}
                            </p>
                        ) : null}
                        <Button type="submit" className={buttonPrimaryClassName}>
                            Sign in
                        </Button>
                    </Form>
                </div>
            </div>
        </main>
    );
}

function Desk(props: { runtime: InvoiceDeskRuntime }) {
    const session = useSession(props.runtime.auth);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notesEnabled, setNotesEnabled] = useState(() =>
        props.runtime.flags.isEnabled(INVOICE_NOTES_FLAG),
    );
    const form = useForm<InvoiceFormValues>({
        defaultValues: emptyInvoiceFormValues(),
    });
    const customer = useFormField(
        "customer",
        { validators: invoiceCustomerValidators },
        toRecordForm(form),
    );
    const amount = useFormField(
        "amount",
        { validators: invoiceAmountValidators },
        toRecordForm(form),
    );
    const status = useFormField(
        "status",
        { validators: invoiceStatusValidators },
        toRecordForm(form),
    );
    const notes = useFormField("notes", {}, toRecordForm(form));
    const customerIds = useMemo(() => createFieldIds("customer"), []);
    const amountIds = useMemo(() => createFieldIds("amount"), []);
    const statusIds = useMemo(() => createFieldIds("status"), []);
    const notesIds = useMemo(() => createFieldIds("notes"), []);

    useEffect(() => {
        return props.runtime.flags.subscribe(() => {
            setNotesEnabled(props.runtime.flags.isEnabled(INVOICE_NOTES_FLAG));
        });
    }, [props.runtime.flags]);

    useEffect(() => {
        return form.subscribe(() => {
            props.runtime.editorValues.current = form.getValues();
            void props.runtime.drafts.scheduleSave();
        });
    }, [form, props.runtime]);

    const http = props.runtime.app.http;
    const invoicesQuery = useQuery<Invoice[]>(
        useMemo(
            () => ({
                queryKey: ["invoices"],
                queryFn: async () => {
                    const response = await http.get<Invoice[]>("/invoices");
                    return response.data;
                },
            }),
            [http],
        ),
    );

    const persist = useMutation<Invoice, Error, InvoiceFormValues>(
        useMemo(
            () => ({
                mutationFn: async (values: InvoiceFormValues) => {
                    const parsedStatus = parseInvoiceStatus(values.status);
                    if (parsedStatus === null) {
                        throw new Error("Invalid status");
                    }
                    const payload = JSON.stringify({
                        customer: values.customer,
                        amount: Number(values.amount),
                        status: parsedStatus,
                        notes: values.notes,
                    });
                    const headers = { "Content-Type": "application/json" };
                    if (editingId) {
                        const response = await props.runtime.app.http.put<Invoice>(
                            `/invoices/${editingId}`,
                            payload,
                            { headers },
                        );
                        return response.data;
                    }
                    const response = await props.runtime.app.http.post<Invoice>(
                        "/invoices",
                        payload,
                        { headers },
                    );
                    return response.data;
                },
                onSuccess: async () => {
                    await props.runtime.app.query.invalidate(["invoices"]);
                    form.reset(emptyInvoiceFormValues());
                    props.runtime.editorValues.current = emptyInvoiceFormValues();
                    setEditingId(null);
                },
            }),
            [editingId, form, props.runtime],
        ),
    );

    const startNew = useCallback(() => {
        setEditingId(null);
        form.reset(emptyInvoiceFormValues());
        props.runtime.editorValues.current = emptyInvoiceFormValues();
    }, [form, props.runtime]);

    const loadInvoice = useCallback(
        (invoice: Invoice) => {
            setEditingId(invoice.id);
            const values = invoiceToFormValues(invoice);
            form.reset(values);
            props.runtime.editorValues.current = values;
        },
        [form, props.runtime],
    );

    const displayName = session.user?.displayName ?? session.user?.email ?? "Signed in";

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        React · Tailwind CSS
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Invoice Desk
                    </h1>
                    <p className="text-sm text-slate-500">{displayName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <Switch
                            checked={notesEnabled}
                            className={switchClassName}
                            onCheckedChange={(checked: boolean) => {
                                props.runtime.flags.setOverride(
                                    INVOICE_NOTES_FLAG,
                                    checked ? null : { enabled: false },
                                );
                            }}
                        />
                        Show notes
                    </label>
                    <Button
                        type="button"
                        className={buttonQuietClassName}
                        onClick={() => {
                            void props.runtime.auth.signOut();
                        }}
                    >
                        Sign out
                    </Button>
                </div>
            </header>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
                <section
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    aria-labelledby="invoice-list-heading"
                >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2
                                id="invoice-list-heading"
                                className="text-lg font-semibold text-slate-900"
                            >
                                Invoices
                            </h2>
                            <p className="text-sm text-slate-500">Click a customer to edit.</p>
                        </div>
                        <Button
                            type="button"
                            className={buttonSecondaryClassName}
                            onClick={startNew}
                        >
                            New invoice
                        </Button>
                    </div>
                    <DataTable
                        columns={[
                            {
                                id: "number",
                                header: "Number",
                                accessor: (row: Invoice) => row.number,
                                sortable: true,
                            },
                            {
                                id: "customer",
                                header: "Customer",
                                accessor: (row: Invoice) => row.customer,
                                sortable: true,
                            },
                            {
                                id: "amount",
                                header: "Amount",
                                accessor: (row: Invoice) => row.amount,
                                sortable: true,
                            },
                            {
                                id: "status",
                                header: "Status",
                                accessor: (row: Invoice) => row.status,
                                sortable: true,
                            },
                        ]}
                        rows={invoicesQuery.data ?? emptyInvoiceRows}
                        getRowId={(row) => row.id}
                        selectable={false}
                        label="Invoices"
                        emptyLabel={invoicesQuery.isPending ? "Loading invoices" : "No invoices"}
                        className="w-full"
                        renderCell={(row, column) => {
                            if (column.id === "customer") {
                                return (
                                    <button
                                        type="button"
                                        className="font-medium text-indigo-700 underline-offset-2 hover:underline"
                                        onClick={() => {
                                            loadInvoice(row);
                                        }}
                                    >
                                        {row.customer}
                                    </button>
                                );
                            }
                            if (column.id === "amount") {
                                return formatInvoiceAmount(row.amount);
                            }
                            if (column.id === "status") {
                                return (
                                    <span className={invoiceStatusBadgeClass(row.status)}>
                                        {row.status}
                                    </span>
                                );
                            }
                            const value = column.accessor?.(row);
                            return value === undefined ? "" : String(value);
                        }}
                    />
                </section>
                <section
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6"
                    aria-labelledby="invoice-editor-heading"
                >
                    <h2
                        id="invoice-editor-heading"
                        className="mb-4 text-lg font-semibold text-slate-900"
                    >
                        {editingId ? "Edit invoice" : "New invoice"}
                    </h2>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={(event: FormEvent) => {
                            event.preventDefault();
                            void form.handleSubmit({
                                onValid: async (values) => {
                                    await persist.mutate(values);
                                },
                                onInvalid: () => {
                                    document.getElementById(customerIds.id)?.focus();
                                },
                            })();
                        }}
                    >
                        <Field
                            ids={customerIds}
                            label="Customer"
                            required
                            invalid={customer.meta.invalid}
                            error={customer.meta.error}
                            classes={fieldClasses}
                        >
                            <Input
                                id={customerIds.id}
                                name="customer"
                                value={String(customer.value ?? "")}
                                onValueChange={customer.setValue}
                                onBlur={customer.onBlur}
                                required
                                invalid={customer.meta.invalid}
                                classes={{ root: inputClassName }}
                            />
                        </Field>
                        <Field
                            ids={amountIds}
                            label="Amount"
                            required
                            invalid={amount.meta.invalid}
                            error={amount.meta.error}
                            classes={fieldClasses}
                        >
                            <Input
                                id={amountIds.id}
                                name="amount"
                                inputMode="decimal"
                                value={String(amount.value ?? "")}
                                onValueChange={amount.setValue}
                                onBlur={amount.onBlur}
                                required
                                invalid={amount.meta.invalid}
                                classes={{ root: inputClassName }}
                            />
                        </Field>
                        <Field
                            ids={statusIds}
                            label="Status"
                            required
                            invalid={status.meta.invalid}
                            error={status.meta.error}
                            classes={fieldClasses}
                        >
                            <Select
                                id={statusIds.id}
                                name="status"
                                value={String(status.value ?? "draft")}
                                options={[...invoiceStatusOptions]}
                                onValueChange={(value: string | null) => {
                                    status.setValue(value ?? "draft");
                                }}
                                onBlur={status.onBlur}
                                required
                                className={selectClassName}
                            />
                        </Field>
                        {notesEnabled ? (
                            <Field ids={notesIds} label="Notes" classes={fieldClasses}>
                                <Input
                                    id={notesIds.id}
                                    name="notes"
                                    value={String(notes.value ?? "")}
                                    onValueChange={notes.setValue}
                                    classes={{ root: inputClassName }}
                                />
                            </Field>
                        ) : null}
                        {persist.isError ? (
                            <p
                                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
                                role="alert"
                            >
                                Could not save the invoice.
                            </p>
                        ) : null}
                        <Button
                            type="submit"
                            disabled={persist.isPending}
                            className={buttonPrimaryClassName}
                        >
                            Save
                        </Button>
                    </form>
                </section>
            </div>
        </main>
    );
}
