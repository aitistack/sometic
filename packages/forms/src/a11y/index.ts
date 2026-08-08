import type { ValidationIssue } from "@sometic/validation";

export type FormAnnouncer = {
    announce: (message: string, options?: { politeness?: "polite" | "assertive" }) => void;
};

export function formatIssueSummary(issues: ValidationIssue[]): string {
    if (issues.length === 0) {
        return "";
    }
    if (issues.length === 1) {
        return issues[0]?.message ?? "Form has an error";
    }
    return `${issues.length} errors need attention. ${issues
        .slice(0, 3)
        .map((issue) => issue.message)
        .join(". ")}`;
}

export function announceFormErrors(announcer: FormAnnouncer, issues: ValidationIssue[]): void {
    const summary = formatIssueSummary(issues);
    if (!summary) {
        return;
    }
    announcer.announce(summary, { politeness: "assertive" });
}

export function focusFirstInvalid(root: ParentNode, issues: ValidationIssue[]): boolean {
    for (const issue of issues) {
        if (!issue.path) {
            continue;
        }
        const selector = `[name="${cssEscape(issue.path)}"], [data-field-path="${cssEscape(issue.path)}"]`;
        const element = root.querySelector(selector);
        if (element instanceof HTMLElement) {
            element.focus();
            return true;
        }
    }
    const fallback = root.querySelector('[aria-invalid="true"]');
    if (fallback instanceof HTMLElement) {
        fallback.focus();
        return true;
    }
    return false;
}

function cssEscape(value: string): string {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }
    return value.replace(/"/g, '\\"');
}
