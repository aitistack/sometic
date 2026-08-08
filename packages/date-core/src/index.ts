export type DateUnit = "day" | "month" | "year";

export type DateAdapterOptions = {
    locale?: string;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export type ParseResult = {
    date: Date | null;
    valid: boolean;
};

export type DateAdapter = {
    parse(value: string, format?: string): ParseResult;
    format(date: Date, format?: string): string;
    isValid(date: Date): boolean;
    compare(a: Date, b: Date): number;
    add(date: Date, amount: number, unit: DateUnit): Date;
    startOf(date: Date, unit: DateUnit): Date;
    endOf(date: Date, unit: DateUnit): Date;
    serialize(date: Date): string;
    deserialize(value: string): ParseResult;
};

export function assertDateAdapter(adapter: DateAdapter): void {
    const methods = [
        "parse",
        "format",
        "isValid",
        "compare",
        "add",
        "startOf",
        "endOf",
        "serialize",
        "deserialize",
    ] as const;
    for (const method of methods) {
        if (typeof adapter[method] !== "function") {
            throw new Error(`DateAdapter missing method: ${method}`);
        }
    }
}
