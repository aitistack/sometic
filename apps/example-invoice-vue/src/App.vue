<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { createFieldIds } from "@sometic/dom/field";
import { email, required } from "@sometic/validation";
import { useAuth } from "@sometic/vue/auth";
import { Button } from "@sometic/vue/button";
import { DataTable } from "@sometic/vue/data";
import { Field } from "@sometic/vue/field";
import { useForm, useFormField } from "@sometic/vue/form";
import { Input } from "@sometic/vue/input";
import { useMutation, useQuery } from "@sometic/vue/query";
import { Select, Switch } from "@sometic/vue/selection";
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

const props = defineProps<{ runtime: InvoiceDeskRuntime }>();
const { session } = useAuth(props.runtime.auth);

const loginError = ref("");
const loginForm = useForm({ defaultValues: { email: "", password: "" } });
const loginEmail = useFormField(loginForm.form, "email", {
    validators: [required("Email is required"), email()],
});
const loginPassword = useFormField(loginForm.form, "password", {
    validators: [required("Password is required")],
});
const loginEmailIds = createFieldIds("email");
const loginPasswordIds = createFieldIds("password");

const notesEnabled = ref(props.runtime.flags.isEnabled(INVOICE_NOTES_FLAG));
props.runtime.flags.subscribe(() => {
    notesEnabled.value = props.runtime.flags.isEnabled(INVOICE_NOTES_FLAG);
});

const editingId = ref<string | null>(null);
const editorForm = useForm<InvoiceFormValues>({
    defaultValues: emptyInvoiceFormValues(),
});
const customer = useFormField(editorForm.form, "customer", {
    validators: invoiceCustomerValidators,
});
const amount = useFormField(editorForm.form, "amount", {
    validators: invoiceAmountValidators,
});
const status = useFormField(editorForm.form, "status", {
    validators: invoiceStatusValidators,
});
const notes = useFormField(editorForm.form, "notes");
const customerIds = createFieldIds("customer");
const amountIds = createFieldIds("amount");
const statusIds = createFieldIds("status");
const notesIds = createFieldIds("notes");
const invoiceStatusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
];

watch(
    () => editorForm.values.value,
    (values) => {
        props.runtime.editorValues.current = values;
        void props.runtime.drafts.scheduleSave();
    },
    { deep: true },
);

const invoicesQuery = useQuery<Invoice[]>(
    computed(() => ({
        queryKey: ["invoices"],
        enabled: session.value.status === "authenticated",
        queryFn: async () => {
            const response = await props.runtime.app.http.get<Invoice[]>("/invoices");
            return response.data;
        },
    })),
);

const persist = useMutation<Invoice, Error, InvoiceFormValues>({
    mutationFn: async (values) => {
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
        if (editingId.value) {
            const response = await props.runtime.app.http.put<Invoice>(
                `/invoices/${editingId.value}`,
                payload,
                { headers },
            );
            return response.data;
        }
        const response = await props.runtime.app.http.post<Invoice>("/invoices", payload, {
            headers,
        });
        return response.data;
    },
    onSuccess: async () => {
        await props.runtime.app.query.invalidate(["invoices"]);
        editorForm.form.reset(emptyInvoiceFormValues());
        props.runtime.editorValues.current = emptyInvoiceFormValues();
        editingId.value = null;
    },
});

const displayName = computed(
    () => session.value.user?.displayName ?? session.value.user?.email ?? "Signed in",
);

const invoiceRows = computed(() => (invoicesQuery.value.data ?? []) as Record<string, unknown>[]);

const invoiceColumns = [
    {
        id: "number",
        header: "Number",
        accessor: (row: Record<string, unknown>) => row["number"],
        sortable: true,
    },
    {
        id: "customer",
        header: "Customer",
        accessor: (row: Record<string, unknown>) => row["customer"],
        sortable: true,
    },
    {
        id: "amount",
        header: "Amount",
        accessor: (row: Record<string, unknown>) =>
            new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                Number(row["amount"] ?? 0),
            ),
        sortable: true,
    },
    {
        id: "status",
        header: "Status",
        accessor: (row: Record<string, unknown>) => row["status"],
        sortable: true,
    },
];

function fillAccount(emailAddress: string): void {
    loginEmail.setValue(emailAddress);
    loginPassword.setValue(INVOICE_DESK_PASSWORD);
}

async function onLogin(event: Event): Promise<void> {
    event.preventDefault();
    await loginForm.form.handleSubmit({
        onValid: async (values) => {
            loginError.value = "";
            try {
                await props.runtime.auth.signIn({
                    email: String(values["email"] ?? ""),
                    password: String(values["password"] ?? ""),
                });
            } catch {
                loginError.value = "Invalid email or password";
                document.getElementById(loginEmailIds.id)?.focus();
            }
        },
        onInvalid: () => {
            document.getElementById(loginEmailIds.id)?.focus();
        },
    })();
}

async function onSave(event: Event): Promise<void> {
    event.preventDefault();
    await editorForm.form.handleSubmit({
        onValid: async (values) => {
            await persist.value.mutate(values);
        },
        onInvalid: () => {
            document.getElementById(customerIds.id)?.focus();
        },
    })();
}

function startNew(): void {
    editingId.value = null;
    editorForm.form.reset(emptyInvoiceFormValues());
    props.runtime.editorValues.current = emptyInvoiceFormValues();
}

function loadInvoice(invoice: Invoice): void {
    editingId.value = invoice.id;
    const values = invoiceToFormValues(invoice);
    editorForm.form.reset(values);
    props.runtime.editorValues.current = values;
}

function onInvoiceTableClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }
    const row = target.closest("[data-row-id]");
    const id = row?.getAttribute("data-row-id");
    if (!id) {
        return;
    }
    const invoice = invoicesQuery.value.data?.find((item) => item.id === id);
    if (invoice) {
        loadInvoice(invoice);
    }
}

function invoiceRowId(row: Record<string, unknown>): string {
    return String(row["id"] ?? "");
}

function onNotesChange(checked: boolean): void {
    props.runtime.flags.setOverride(INVOICE_NOTES_FLAG, checked ? null : { enabled: false });
}
</script>

<template>
    <main
        class="ledger-shell"
        :data-surface="session.status === 'authenticated' ? 'desk' : 'login'"
    >
        <template v-if="session.status !== 'authenticated'">
            <p class="ledger-kicker">Vue · Plain CSS</p>
            <h1>Invoice Desk</h1>
            <p class="ledger-lede">
                Same Sometic engines as React and Vanilla. This app styles unstyled slots with
                hand-written CSS and
                <code>data-slot</code>
                selectors.
            </p>
            <div class="ledger-accounts">
                <button
                    v-for="account in INVOICE_DESK_USERS"
                    :key="account.email"
                    type="button"
                    class="ledger-account"
                    @click="fillAccount(account.email)"
                >
                    <strong>{{ account.user.displayName }}</strong>
                    <span>{{ account.email }}</span>
                </button>
            </div>
            <p class="ledger-hint">Password for both accounts: {{ INVOICE_DESK_PASSWORD }}</p>
            <div class="ledger-card">
                <form class="ledger-form" novalidate @submit="onLogin">
                    <Field
                        :ids="loginEmailIds"
                        label="Email"
                        required
                        :invalid="loginEmail.meta.value.invalid"
                        :error="loginEmail.meta.value.error"
                    >
                        <Input
                            :id="loginEmailIds.id"
                            name="email"
                            type="email"
                            autocomplete="username"
                            :model-value="String(loginEmail.value.value ?? '')"
                            required
                            :invalid="loginEmail.meta.value.invalid"
                            @update:model-value="loginEmail.setValue"
                            @blur="loginEmail.onBlur"
                        />
                    </Field>
                    <Field
                        :ids="loginPasswordIds"
                        label="Password"
                        required
                        :invalid="loginPassword.meta.value.invalid"
                        :error="loginPassword.meta.value.error"
                    >
                        <Input
                            :id="loginPasswordIds.id"
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            :model-value="String(loginPassword.value.value ?? '')"
                            required
                            :invalid="loginPassword.meta.value.invalid"
                            @update:model-value="loginPassword.setValue"
                            @blur="loginPassword.onBlur"
                        />
                    </Field>
                    <p v-if="loginError" class="ledger-alert" role="alert">{{ loginError }}</p>
                    <Button type="submit">Sign in</Button>
                </form>
            </div>
        </template>
        <template v-else>
            <header class="ledger-header">
                <div>
                    <p class="ledger-kicker">Vue · Plain CSS</p>
                    <h1>Invoice Desk</h1>
                    <p class="ledger-lede">{{ displayName }}</p>
                </div>
                <div class="ledger-actions">
                    <label class="ledger-toggle">
                        <Switch :checked="notesEnabled" @checked-change="onNotesChange" />
                        Show notes
                    </label>
                    <Button type="button" variant="quiet" @click="props.runtime.auth.signOut()">
                        Sign out
                    </Button>
                </div>
            </header>
            <div class="ledger-grid">
                <section class="ledger-card" aria-labelledby="invoice-list-heading">
                    <div class="ledger-card-head">
                        <div>
                            <h2 id="invoice-list-heading">Invoices</h2>
                            <p class="ledger-lede">Click a row to edit.</p>
                        </div>
                        <Button type="button" variant="secondary" @click="startNew">
                            New invoice
                        </Button>
                    </div>
                    <div @click="onInvoiceTableClick">
                        <DataTable
                            :columns="invoiceColumns"
                            :rows="invoiceRows"
                            :get-row-id="invoiceRowId"
                            :selectable="false"
                            label="Invoices"
                            :empty-label="
                                invoicesQuery.isPending ? 'Loading invoices' : 'No invoices'
                            "
                        />
                    </div>
                </section>
                <section class="ledger-card ledger-editor" aria-labelledby="invoice-editor-heading">
                    <h2 id="invoice-editor-heading">
                        {{ editingId ? "Edit invoice" : "New invoice" }}
                    </h2>
                    <form class="ledger-form" novalidate @submit="onSave">
                        <Field
                            :ids="customerIds"
                            label="Customer"
                            required
                            :invalid="customer.meta.value.invalid"
                            :error="customer.meta.value.error"
                        >
                            <Input
                                :id="customerIds.id"
                                name="customer"
                                :model-value="String(customer.value.value ?? '')"
                                required
                                :invalid="customer.meta.value.invalid"
                                @update:model-value="customer.setValue"
                                @blur="customer.onBlur"
                            />
                        </Field>
                        <Field
                            :ids="amountIds"
                            label="Amount"
                            required
                            :invalid="amount.meta.value.invalid"
                            :error="amount.meta.value.error"
                        >
                            <Input
                                :id="amountIds.id"
                                name="amount"
                                inputmode="decimal"
                                :model-value="String(amount.value.value ?? '')"
                                required
                                :invalid="amount.meta.value.invalid"
                                @update:model-value="amount.setValue"
                                @blur="amount.onBlur"
                            />
                        </Field>
                        <Field
                            :ids="statusIds"
                            label="Status"
                            required
                            :invalid="status.meta.value.invalid"
                            :error="status.meta.value.error"
                        >
                            <Select
                                :id="statusIds.id"
                                name="status"
                                :model-value="String(status.value.value ?? 'draft')"
                                :options="invoiceStatusOptions"
                                required
                                @update:model-value="
                                    (value: string | null) => status.setValue(value ?? 'draft')
                                "
                                @blur="status.onBlur"
                            />
                        </Field>
                        <Field v-if="notesEnabled" :ids="notesIds" label="Notes">
                            <Input
                                :id="notesIds.id"
                                name="notes"
                                :model-value="String(notes.value.value ?? '')"
                                @update:model-value="notes.setValue"
                            />
                        </Field>
                        <p v-if="persist.isError" class="ledger-alert" role="alert">
                            Could not save the invoice.
                        </p>
                        <Button type="submit" :disabled="persist.isPending">Save</Button>
                    </form>
                </section>
            </div>
        </template>
    </main>
</template>
