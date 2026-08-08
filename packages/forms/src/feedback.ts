import type { ValidationIssue } from "@sometic/validation";

export type FormFeedbackKind = "idle" | "validation" | "success" | "error";

export type FormFeedback = {
    kind: FormFeedbackKind;
    message: string;
    issues: ValidationIssue[];
};

export type FormFeedbackFlags = {
    validation: boolean;
    success: boolean;
    error: boolean;
};

export type FormFeedbackOption = boolean | Partial<FormFeedbackFlags>;

export const DEFAULT_FORM_FEEDBACK: FormFeedbackFlags = {
    validation: true,
    success: true,
    error: true,
};

export function resolveFormFeedbackFlags(option?: FormFeedbackOption): FormFeedbackFlags {
    if (option === false) {
        return { validation: false, success: false, error: false };
    }
    if (option === true || option === undefined) {
        return { ...DEFAULT_FORM_FEEDBACK };
    }
    return {
        validation: option.validation !== false,
        success: option.success !== false,
        error: option.error !== false,
    };
}

export function createIdleFeedback(): FormFeedback {
    return { kind: "idle", message: "", issues: [] };
}

export function createValidationFeedback(
    issues: ValidationIssue[],
    message?: string,
): FormFeedback {
    const first = issues[0]?.message;
    return {
        kind: "validation",
        message: message ?? first ?? "Please fix the highlighted fields.",
        issues: [...issues],
    };
}

export function createSuccessFeedback(message = "Saved successfully."): FormFeedback {
    return { kind: "success", message, issues: [] };
}

export function createErrorFeedback(message: string, issues: ValidationIssue[] = []): FormFeedback {
    return { kind: "error", message, issues: [...issues] };
}

export function feedbackAttributes(feedback: FormFeedback): Record<string, string> {
    if (feedback.kind === "idle") {
        return { "data-feedback": "idle", hidden: "" };
    }
    return {
        "data-feedback": feedback.kind,
        role: feedback.kind === "success" ? "status" : "alert",
    };
}
