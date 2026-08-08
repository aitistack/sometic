export type ClassDictionary = Record<string, boolean | null | undefined>;

export type ClassValue =
    string | number | boolean | null | undefined | ClassDictionary | readonly ClassValue[];

export type ClassMerger = (classes: readonly string[]) => string;

export type ClassResolver = (...inputs: ClassValue[]) => string;

function pushTokens(value: string | number, out: string[]): void {
    const text = String(value).trim();
    if (text.length === 0) {
        return;
    }
    for (const token of text.split(/\s+/)) {
        if (token.length > 0) {
            out.push(token);
        }
    }
}

function isClassDictionary(input: object): input is ClassDictionary {
    return !Array.isArray(input);
}

function flattenClassValue(input: ClassValue, out: string[]): void {
    if (input == null || input === false || input === true) {
        return;
    }
    if (typeof input === "string" || typeof input === "number") {
        pushTokens(input, out);
        return;
    }
    if (!isClassDictionary(input)) {
        for (const item of input) {
            flattenClassValue(item, out);
        }
        return;
    }
    for (const key of Object.keys(input)) {
        if (input[key]) {
            pushTokens(key, out);
        }
    }
}

export function collectClassTokens(...inputs: ClassValue[]): string[] {
    const out: string[] = [];
    for (const input of inputs) {
        flattenClassValue(input, out);
    }
    return out;
}

export function resolveClasses(...inputs: ClassValue[]): string {
    return collectClassTokens(...inputs).join(" ");
}

export function createClassResolver(options: { merge?: ClassMerger } = {}): ClassResolver {
    const merge = options.merge;
    return (...inputs: ClassValue[]): string => {
        const tokens = collectClassTokens(...inputs);
        return merge ? merge(tokens) : tokens.join(" ");
    };
}
