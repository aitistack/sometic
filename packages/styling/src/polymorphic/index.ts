export type PolymorphicAs = string;

export type PolymorphicProps<DefaultAs extends string = string> = {
    as?: PolymorphicAs;
    defaultAs?: DefaultAs;
};

export function resolvePolymorphicAs(
    as: PolymorphicAs | null | undefined,
    defaultAs: string,
): string {
    if (as == null) {
        return defaultAs;
    }
    const trimmed = as.trim();
    return trimmed.length > 0 ? trimmed : defaultAs;
}
