import {
    assertDateAdapter,
    type DateAdapter,
    type DateAdapterOptions,
    type DateUnit,
    type ParseResult,
} from "@sometic/date-core";

function pad2(value: number): string {
    return value < 10 ? `0${value}` : String(value);
}

function toDateOnlyString(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseDateOnly(value: string): ParseResult {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return { date: null, valid: false };
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return { date: null, valid: false };
    }
    return { date, valid: true };
}

function isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
}

export function createNativeDateAdapter(_options: DateAdapterOptions = {}): DateAdapter {
    void _options;
    const adapter: DateAdapter = {
        parse(value, format) {
            if (format === "yyyy-MM-dd" || format === undefined) {
                const dateOnly = parseDateOnly(value);
                if (dateOnly.valid) {
                    return dateOnly;
                }
            }
            if (format !== undefined && format !== "yyyy-MM-dd") {
                return { date: null, valid: false };
            }
            const parsed = new Date(value);
            if (!isValidDate(parsed)) {
                return { date: null, valid: false };
            }
            return { date: parsed, valid: true };
        },
        format(date, format) {
            if (!isValidDate(date)) {
                return "";
            }
            if (format === undefined || format === "yyyy-MM-dd") {
                return toDateOnlyString(date);
            }
            return toDateOnlyString(date);
        },
        isValid(date) {
            return isValidDate(date);
        },
        compare(a, b) {
            return a.getTime() - b.getTime();
        },
        add(date, amount, unit: DateUnit) {
            const next = new Date(date.getTime());
            if (unit === "day") {
                next.setDate(next.getDate() + amount);
            } else if (unit === "month") {
                next.setMonth(next.getMonth() + amount);
            } else {
                next.setFullYear(next.getFullYear() + amount);
            }
            return next;
        },
        startOf(date, unit) {
            const next = new Date(date.getTime());
            if (unit === "day") {
                next.setHours(0, 0, 0, 0);
            } else if (unit === "month") {
                next.setDate(1);
                next.setHours(0, 0, 0, 0);
            } else {
                next.setMonth(0, 1);
                next.setHours(0, 0, 0, 0);
            }
            return next;
        },
        endOf(date, unit) {
            const next = new Date(date.getTime());
            if (unit === "day") {
                next.setHours(23, 59, 59, 999);
            } else if (unit === "month") {
                next.setMonth(next.getMonth() + 1, 0);
                next.setHours(23, 59, 59, 999);
            } else {
                next.setMonth(11, 31);
                next.setHours(23, 59, 59, 999);
            }
            return next;
        },
        serialize(date) {
            if (!isValidDate(date)) {
                return "";
            }
            return toDateOnlyString(date);
        },
        deserialize(value) {
            return parseDateOnly(value);
        },
    };
    assertDateAdapter(adapter);
    return adapter;
}
