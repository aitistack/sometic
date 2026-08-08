import {
    addDays,
    addMonths,
    addYears,
    compareAsc,
    endOfDay,
    endOfMonth,
    endOfYear,
    format as formatDate,
    isValid as isValidDate,
    parse as parseDate,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfYear,
} from "date-fns";
import {
    assertDateAdapter,
    type DateAdapter,
    type DateAdapterOptions,
    type DateUnit,
} from "@sometic/date-core";

export function createDateFnsDateAdapter(_options: DateAdapterOptions = {}): DateAdapter {
    void _options;
    const adapter: DateAdapter = {
        parse(value, format) {
            if (format === undefined || format === "yyyy-MM-dd") {
                const iso = parseISO(value);
                if (isValidDate(iso) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                    return { date: iso, valid: true };
                }
                if (format === "yyyy-MM-dd") {
                    const parsed = parseDate(value, "yyyy-MM-dd", new Date());
                    if (!isValidDate(parsed)) {
                        return { date: null, valid: false };
                    }
                    return { date: parsed, valid: true };
                }
            }
            if (format) {
                const parsed = parseDate(value, format, new Date());
                if (!isValidDate(parsed)) {
                    return { date: null, valid: false };
                }
                return { date: parsed, valid: true };
            }
            const fallback = parseISO(value);
            if (!isValidDate(fallback)) {
                return { date: null, valid: false };
            }
            return { date: fallback, valid: true };
        },
        format(date, format) {
            if (!isValidDate(date)) {
                return "";
            }
            return formatDate(date, format ?? "yyyy-MM-dd");
        },
        isValid(date) {
            return isValidDate(date);
        },
        compare(a, b) {
            return compareAsc(a, b);
        },
        add(date, amount, unit: DateUnit) {
            if (unit === "day") {
                return addDays(date, amount);
            }
            if (unit === "month") {
                return addMonths(date, amount);
            }
            return addYears(date, amount);
        },
        startOf(date, unit) {
            if (unit === "day") {
                return startOfDay(date);
            }
            if (unit === "month") {
                return startOfMonth(date);
            }
            return startOfYear(date);
        },
        endOf(date, unit) {
            if (unit === "day") {
                return endOfDay(date);
            }
            if (unit === "month") {
                return endOfMonth(date);
            }
            return endOfYear(date);
        },
        serialize(date) {
            if (!isValidDate(date)) {
                return "";
            }
            return formatDate(date, "yyyy-MM-dd");
        },
        deserialize(value) {
            const parsed = parseDate(value, "yyyy-MM-dd", new Date());
            if (!isValidDate(parsed)) {
                return { date: null, valid: false };
            }
            return { date: parsed, valid: true };
        },
    };
    assertDateAdapter(adapter);
    return adapter;
}
