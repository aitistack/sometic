import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";

export type FeatureFlagVariant = string | boolean | number | null;

export type FeatureFlagDefinition = {
    key: string;
    defaultValue: boolean;
    defaultVariant?: FeatureFlagVariant;
    description?: string;
};

export type FeatureFlagOverride = {
    enabled?: boolean;
    variant?: FeatureFlagVariant;
};

export type FeatureFlagSnapshot = {
    key: string;
    enabled: boolean;
    variant: FeatureFlagVariant;
    source: "default" | "remote" | "override";
};

export type CreateFeatureFlagControllerOptions = {
    flags: readonly FeatureFlagDefinition[];
    remote?: Readonly<Record<string, FeatureFlagOverride>>;
    overrides?: Readonly<Record<string, FeatureFlagOverride>>;
    onChange?: (snapshots: FeatureFlagSnapshot[]) => void;
};

export type FeatureFlagController = {
    isEnabled: (key: string) => boolean;
    getVariant: (key: string) => FeatureFlagVariant;
    getSnapshot: (key: string) => FeatureFlagSnapshot;
    list: () => FeatureFlagSnapshot[];
    setOverride: (key: string, override: FeatureFlagOverride | null) => void;
    setRemote: (remote: Readonly<Record<string, FeatureFlagOverride>>) => void;
    clearOverrides: () => void;
    subscribe: (listener: (snapshots: FeatureFlagSnapshot[]) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

function assertKey(key: string): void {
    if (typeof key !== "string" || key.trim() === "") {
        throw createError({
            code: "FEATURE_FLAG_INVALID_KEY",
            message: "Feature flag key must be a non-empty string",
        });
    }
}

export function createFeatureFlagController(
    options: CreateFeatureFlagControllerOptions,
): FeatureFlagController {
    if (!Array.isArray(options.flags) || options.flags.length === 0) {
        throw createError({
            code: "FEATURE_FLAG_EMPTY",
            message: "At least one feature flag definition is required",
        });
    }

    const definitions = new Map<string, FeatureFlagDefinition>();
    for (const flag of options.flags) {
        assertKey(flag.key);
        if (definitions.has(flag.key)) {
            throw createError({
                code: "FEATURE_FLAG_DUPLICATE",
                message: `Duplicate feature flag key: ${flag.key}`,
            });
        }
        definitions.set(flag.key, flag);
    }

    let remote: Record<string, FeatureFlagOverride> = { ...(options.remote ?? {}) };
    let overrides: Record<string, FeatureFlagOverride> = { ...(options.overrides ?? {}) };
    const listeners = new Set<(snapshots: FeatureFlagSnapshot[]) => void>();

    const disposable = createDisposable(() => {
        listeners.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "FEATURE_FLAG_DISPOSED",
                message: "This feature flag controller has been disposed",
            });
        }
    };

    const resolve = (key: string): FeatureFlagSnapshot => {
        assertKey(key);
        const definition = definitions.get(key);
        if (!definition) {
            throw createError({
                code: "FEATURE_FLAG_UNKNOWN",
                message: `Unknown feature flag: ${key}`,
            });
        }
        const override = overrides[key];
        if (override) {
            return {
                key,
                enabled: override.enabled ?? definition.defaultValue,
                variant:
                    override.variant !== undefined
                        ? override.variant
                        : (definition.defaultVariant ?? definition.defaultValue),
                source: "override",
            };
        }
        const remoteValue = remote[key];
        if (remoteValue) {
            return {
                key,
                enabled: remoteValue.enabled ?? definition.defaultValue,
                variant:
                    remoteValue.variant !== undefined
                        ? remoteValue.variant
                        : (definition.defaultVariant ?? definition.defaultValue),
                source: "remote",
            };
        }
        return {
            key,
            enabled: definition.defaultValue,
            variant: definition.defaultVariant ?? definition.defaultValue,
            source: "default",
        };
    };

    const list = (): FeatureFlagSnapshot[] => [...definitions.keys()].map((key) => resolve(key));

    const emit = (): void => {
        const snapshots = list();
        options.onChange?.(snapshots);
        for (const listener of listeners) {
            listener(snapshots);
        }
    };

    return {
        isEnabled(key) {
            assertActive();
            return resolve(key).enabled;
        },
        getVariant(key) {
            assertActive();
            return resolve(key).variant;
        },
        getSnapshot(key) {
            assertActive();
            return resolve(key);
        },
        list() {
            assertActive();
            return list();
        },
        setOverride(key, override) {
            assertActive();
            assertKey(key);
            if (!definitions.has(key)) {
                throw createError({
                    code: "FEATURE_FLAG_UNKNOWN",
                    message: `Unknown feature flag: ${key}`,
                });
            }
            if (override === null) {
                const next = { ...overrides };
                delete next[key];
                overrides = next;
            } else {
                overrides = { ...overrides, [key]: { ...override } };
            }
            emit();
        },
        setRemote(next) {
            assertActive();
            remote = { ...next };
            emit();
        },
        clearOverrides() {
            assertActive();
            overrides = {};
            emit();
        },
        subscribe(listener) {
            assertActive();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
