export const SLOT_ATTRIBUTE = "data-slot";

export type SlotAttributes = {
    readonly "data-slot": string;
};

export function defineSlots<const T extends readonly string[]>(slots: T): T {
    return slots;
}

export function createSlotAttributes(slot: string): SlotAttributes {
    return { [SLOT_ATTRIBUTE]: slot };
}

export function getSlotName(attributes: Readonly<Record<string, string>>): string | undefined {
    const value = attributes[SLOT_ATTRIBUTE];
    return value === undefined || value.length === 0 ? undefined : value;
}

export function pickSlotValue<S extends string, V>(
    map: Partial<Record<S, V>> | undefined,
    slot: S,
): V | undefined {
    if (map == null) {
        return undefined;
    }
    return map[slot];
}
