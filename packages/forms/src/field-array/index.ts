import { getAt, setAt } from "@sometic/validation";

export type FieldArrayItem = {
    key: string;
    index: number;
};

export type FieldArrayController<TItem> = {
    fields: () => FieldArrayItem[];
    append: (item?: TItem) => void;
    prepend: (item?: TItem) => void;
    insert: (index: number, item?: TItem) => void;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    swap: (a: number, b: number) => void;
    replace: (index: number, item: TItem) => void;
    update: (index: number, item: TItem) => void;
};

type CreateFieldArrayOptions<TValues, TItem> = {
    name: string;
    getValues: () => TValues;
    setValues: (values: TValues) => void;
    defaultItem?: TItem;
};

let keyCounter = 0;

function nextKey(): string {
    keyCounter += 1;
    return `fa-${keyCounter}`;
}

export function createFieldArrayController<TValues, TItem>(
    options: CreateFieldArrayOptions<TValues, TItem>,
): FieldArrayController<TItem> {
    const keys: string[] = [];

    const readArray = (): TItem[] => {
        const value = getAt(options.getValues(), options.name);
        return Array.isArray(value) ? (value as TItem[]) : [];
    };

    const writeArray = (items: TItem[]): void => {
        options.setValues(setAt(options.getValues(), options.name, items));
        while (keys.length < items.length) {
            keys.push(nextKey());
        }
        if (keys.length > items.length) {
            keys.length = items.length;
        }
    };

    const ensureKeys = (length: number): void => {
        while (keys.length < length) {
            keys.push(nextKey());
        }
        if (keys.length > length) {
            keys.length = length;
        }
    };

    return {
        fields: () => {
            const items = readArray();
            ensureKeys(items.length);
            return items.map((_, index) => ({
                key: keys[index] ?? nextKey(),
                index,
            }));
        },
        append: (item) => {
            const items = readArray();
            items.push(item ?? (options.defaultItem as TItem));
            keys.push(nextKey());
            writeArray(items);
        },
        prepend: (item) => {
            const items = readArray();
            items.unshift(item ?? (options.defaultItem as TItem));
            keys.unshift(nextKey());
            writeArray(items);
        },
        insert: (index, item) => {
            const items = readArray();
            items.splice(index, 0, item ?? (options.defaultItem as TItem));
            keys.splice(index, 0, nextKey());
            writeArray(items);
        },
        remove: (index) => {
            const items = readArray();
            items.splice(index, 1);
            keys.splice(index, 1);
            writeArray(items);
        },
        move: (from, to) => {
            const items = readArray();
            if (from < 0 || to < 0 || from >= items.length || to >= items.length) {
                return;
            }
            const [item] = items.splice(from, 1);
            const [key] = keys.splice(from, 1);
            if (item === undefined || key === undefined) {
                return;
            }
            items.splice(to, 0, item);
            keys.splice(to, 0, key);
            writeArray(items);
        },
        swap: (a, b) => {
            const items = readArray();
            if (a < 0 || b < 0 || a >= items.length || b >= items.length) {
                return;
            }
            const itemA = items[a];
            const itemB = items[b];
            const keyA = keys[a];
            const keyB = keys[b];
            if (
                itemA === undefined ||
                itemB === undefined ||
                keyA === undefined ||
                keyB === undefined
            ) {
                return;
            }
            items[a] = itemB;
            items[b] = itemA;
            keys[a] = keyB;
            keys[b] = keyA;
            writeArray(items);
        },
        replace: (index, item) => {
            const items = readArray();
            if (index < 0 || index >= items.length) {
                return;
            }
            items[index] = item;
            writeArray(items);
        },
        update: (index, item) => {
            const items = readArray();
            if (index < 0 || index >= items.length) {
                return;
            }
            items[index] = item;
            writeArray(items);
        },
    };
}
