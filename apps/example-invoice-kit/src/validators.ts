import { createIssue, min, ok, required, type SyncValidator } from "@sometic/validation";
import { parseInvoiceStatus } from "./model.js";

export const invoiceCustomerValidators: readonly SyncValidator[] = [
    required("Customer is required"),
];

export const invoiceAmountValidators: readonly SyncValidator[] = [
    required("Amount is required"),
    min(0.01, "Amount must be greater than zero"),
];

export const invoiceStatusValidators: readonly SyncValidator[] = [
    required("Status is required"),
    (value, context) => {
        if (typeof value !== "string" || parseInvoiceStatus(value) === null) {
            return createIssue("invoice-status", "Status must be draft, sent, or paid", {
                path: context.path,
            });
        }
        return ok();
    },
];
