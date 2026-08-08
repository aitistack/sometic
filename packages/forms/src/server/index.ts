import type { ValidationIssue } from "@sometic/validation";

function asIssue(
    path: string | undefined,
    message: string,
    code: string | undefined,
): ValidationIssue {
    const issue: ValidationIssue = {
        code: code ?? "server",
        message,
    };
    if (path !== undefined && path.length > 0) {
        issue.path = path;
    }
    return issue;
}

function mapErrorEntry(entry: unknown): ValidationIssue | undefined {
    if (typeof entry === "string") {
        return asIssue(undefined, entry, "server");
    }
    if (!entry || typeof entry !== "object") {
        return undefined;
    }
    const record = entry as Record<string, unknown>;
    const pathValue = record.path ?? record.field ?? record.pointer ?? record.name;
    const path =
        typeof pathValue === "string"
            ? pathValue.replace(/^#\//, "").replaceAll("/", ".")
            : undefined;
    const messageValue =
        record.message ?? record.title ?? record.detail ?? record.reason ?? record.error;
    const message =
        typeof messageValue === "string"
            ? messageValue
            : path
              ? `Invalid ${path}`
              : "Invalid value";
    const code = typeof record.code === "string" ? record.code : undefined;
    return asIssue(path, message, code);
}

function mapFieldErrors(fieldErrors: Record<string, unknown>): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    for (const [field, value] of Object.entries(fieldErrors)) {
        if (typeof value === "string") {
            issues.push(asIssue(field, value, "server"));
            continue;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === "string") {
                    issues.push(asIssue(field, item, "server"));
                } else {
                    const mapped = mapErrorEntry(
                        typeof item === "object" && item !== null
                            ? { ...item, path: field }
                            : item,
                    );
                    if (mapped) {
                        issues.push(mapped);
                    }
                }
            }
        }
    }
    return issues;
}

export function mapServerErrorBody(body: unknown): ValidationIssue[] {
    if (body == null) {
        return [];
    }
    if (typeof body === "string") {
        return [asIssue(undefined, body, "server")];
    }
    if (Array.isArray(body)) {
        return body
            .map((entry) => mapErrorEntry(entry))
            .filter((issue): issue is ValidationIssue => issue !== undefined);
    }
    if (typeof body !== "object") {
        return [];
    }

    const record = body as Record<string, unknown>;
    const issues: ValidationIssue[] = [];

    if (Array.isArray(record.errors)) {
        for (const entry of record.errors) {
            const mapped = mapErrorEntry(entry);
            if (mapped) {
                issues.push(mapped);
            }
        }
    }

    if (
        record.fieldErrors &&
        typeof record.fieldErrors === "object" &&
        !Array.isArray(record.fieldErrors)
    ) {
        issues.push(...mapFieldErrors(record.fieldErrors as Record<string, unknown>));
    }

    if (record.errors && typeof record.errors === "object" && !Array.isArray(record.errors)) {
        issues.push(...mapFieldErrors(record.errors as Record<string, unknown>));
    }

    if (Array.isArray(record.invalid_params)) {
        for (const entry of record.invalid_params) {
            const mapped = mapErrorEntry(entry);
            if (mapped) {
                issues.push(mapped);
            }
        }
    }

    if (typeof record.detail === "string" && issues.length === 0) {
        issues.push(asIssue(undefined, record.detail, "server"));
    }

    if (typeof record.title === "string" && issues.length === 0) {
        const detail = typeof record.detail === "string" ? record.detail : record.title;
        issues.push(asIssue(undefined, detail, "server"));
    }

    return issues;
}
