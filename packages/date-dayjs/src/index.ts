import type dayjs from "dayjs";
import {
    assertDateAdapter,
    type DateAdapter,
    type DateAdapterOptions,
    type DateUnit,
} from "@sometic/date-core";

type DayjsApi = typeof dayjs;

function parseYmd(dayjsApi: DayjsApi, value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return { date: null, valid: false as const };
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const instance = dayjsApi(new Date(year, month - 1, day));
    if (
        !instance.isValid() ||
        instance.year() !== year ||
        instance.month() !== month - 1 ||
        instance.date() !== day
    ) {
        return { date: null, valid: false as const };
    }
    return { date: instance.toDate(), valid: true as const };
}

export function createDayjsDateAdapter(
    dayjsApi: DayjsApi,
    _options: DateAdapterOptions = {},
): DateAdapter {
    void _options;
    const adapter: DateAdapter = {
        parse(value, format) {
            if (format === undefined || format === "YYYY-MM-DD" || format === "yyyy-MM-dd") {
                const ymd = parseYmd(dayjsApi, value);
                if (ymd.valid) {
                    return ymd;
                }
            }
            const parsed = dayjsApi(value);
            if (!parsed.isValid()) {
                return { date: null, valid: false };
            }
            return { date: parsed.toDate(), valid: true };
        },
        format(date, format) {
            const instance = dayjsApi(date);
            if (!instance.isValid()) {
                return "";
            }
            return instance.format(format ?? "YYYY-MM-DD");
        },
        isValid(date) {
            return dayjsApi(date).isValid();
        },
        compare(a, b) {
            return dayjsApi(a).valueOf() - dayjsApi(b).valueOf();
        },
        add(date, amount, unit: DateUnit) {
            return dayjsApi(date).add(amount, unit).toDate();
        },
        startOf(date, unit) {
            return dayjsApi(date).startOf(unit).toDate();
        },
        endOf(date, unit) {
            return dayjsApi(date).endOf(unit).toDate();
        },
        serialize(date) {
            const instance = dayjsApi(date);
            if (!instance.isValid()) {
                return "";
            }
            return instance.format("YYYY-MM-DD");
        },
        deserialize(value) {
            return parseYmd(dayjsApi, value);
        },
    };
    assertDateAdapter(adapter);
    return adapter;
}
