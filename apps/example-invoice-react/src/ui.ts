export const fieldClasses = {
    root: "flex flex-col gap-1.5",
    label: "text-sm font-medium text-slate-700",
    error: "text-sm text-rose-600",
    control: "w-full",
};

export const inputClassName =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-[invalid=true]:border-rose-400";

export const selectClassName = inputClassName;

export const buttonPrimaryClassName =
    "inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

export const buttonSecondaryClassName =
    "inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

export const buttonQuietClassName =
    "inline-flex h-10 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export const switchClassName = "desk-switch";

export const invoiceStatusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
] as const;

export function formatInvoiceAmount(amount: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function invoiceStatusBadgeClass(status: string): string {
    if (status === "paid") {
        return "inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700";
    }
    if (status === "sent") {
        return "inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-sky-700";
    }
    return "inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-800";
}
