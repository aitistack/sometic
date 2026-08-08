export type ValidationIssue = {
    code: string;
    message: string;
    path?: string;
    params?: Record<string, unknown>;
};

export type ValidationResult = {
    valid: boolean;
    issues: ValidationIssue[];
};

export function createIssue(
    code: string,
    message: string,
    options: { path?: string; params?: Record<string, unknown> } = {},
): ValidationIssue {
    const issue: ValidationIssue = { code, message };
    if (options.path !== undefined) {
        issue.path = options.path;
    }
    if (options.params !== undefined) {
        issue.params = options.params;
    }
    return issue;
}

export function ok(): ValidationResult {
    return { valid: true, issues: [] };
}

export function fail(issues: ValidationIssue | ValidationIssue[]): ValidationResult {
    const list = Array.isArray(issues) ? issues : [issues];
    return { valid: list.length === 0, issues: list };
}

export function mergeResults(...results: ValidationResult[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    for (const result of results) {
        issues.push(...result.issues);
    }
    return { valid: issues.length === 0, issues };
}

export function issuesForPath(issues: ValidationIssue[], path: string): ValidationIssue[] {
    return issues.filter((issue) => issue.path === path || issue.path === undefined);
}
