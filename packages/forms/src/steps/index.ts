import type { FormController } from "../create-form.js";
import { createValidationFeedback } from "../feedback.js";

export type FormStepField = {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
};

export type FormStepDefinition = {
    id: string;
    title?: string;
    description?: string;
    fields: readonly (string | FormStepField)[];
};

export type FormStepsOptions<TValues extends Record<string, unknown>> = {
    form: FormController<TValues>;
    steps: readonly FormStepDefinition[];
    initialStepIndex?: number;
};

export type FormStepsController = {
    getStepIndex: () => number;
    getStep: () => FormStepDefinition;
    getSteps: () => readonly FormStepDefinition[];
    getStepFieldNames: (step?: FormStepDefinition) => string[];
    getStepFields: (step?: FormStepDefinition) => FormStepField[];
    canNext: () => Promise<boolean>;
    next: () => Promise<boolean>;
    back: () => void;
    goTo: (index: number) => Promise<boolean>;
    isFirst: () => boolean;
    isLast: () => boolean;
};

export function normalizeStepField(field: string | FormStepField): FormStepField {
    if (typeof field === "string") {
        return { name: field };
    }
    return field;
}

export function getStepFieldNames(step: FormStepDefinition): string[] {
    return step.fields.map((field) => normalizeStepField(field).name);
}

export function getStepFields(step: FormStepDefinition): FormStepField[] {
    return step.fields.map((field) => normalizeStepField(field));
}

export function createFormSteps<TValues extends Record<string, unknown>>(
    options: FormStepsOptions<TValues>,
): FormStepsController {
    let index = options.initialStepIndex ?? 0;
    if (index < 0 || index >= options.steps.length) {
        index = 0;
    }

    const getStep = (): FormStepDefinition => {
        const step = options.steps[index];
        if (!step) {
            throw new Error("Form step is missing");
        }
        return step;
    };

    const validateCurrent = async (): Promise<boolean> => {
        const names = getStepFieldNames(getStep());
        const ok = await options.form.validateForm(names);
        if (!ok) {
            const flags = options.form.getFeedbackFlags();
            if (flags.validation || flags.error) {
                const issues = options.form
                    .getIssues()
                    .filter((issue) => issue.path !== undefined && names.includes(issue.path));
                options.form.setFeedback(
                    createValidationFeedback(issues, "Please complete this step."),
                );
            }
        } else {
            options.form.clearFeedback();
        }
        return ok;
    };

    return {
        getStepIndex: () => index,
        getStep,
        getSteps: () => options.steps,
        getStepFieldNames: (step) => getStepFieldNames(step ?? getStep()),
        getStepFields: (step) => getStepFields(step ?? getStep()),
        canNext: async () => validateCurrent(),
        next: async () => {
            const ok = await validateCurrent();
            if (!ok) {
                return false;
            }
            if (index < options.steps.length - 1) {
                index += 1;
            }
            return true;
        },
        back: () => {
            if (index > 0) {
                index -= 1;
            }
            options.form.clearFeedback();
        },
        goTo: async (target) => {
            if (target < 0 || target >= options.steps.length) {
                return false;
            }
            if (target > index) {
                for (let current = index; current < target; current += 1) {
                    const step = options.steps[current];
                    if (!step) {
                        return false;
                    }
                    index = current;
                    const ok = await validateCurrent();
                    if (!ok) {
                        return false;
                    }
                }
            }
            index = target;
            options.form.clearFeedback();
            return true;
        },
        isFirst: () => index === 0,
        isLast: () => index === options.steps.length - 1,
    };
}
