export type AdapterFrameworkId =
    | "react"
    | "vue"
    | "angular"
    | "svelte"
    | "solid"
    | "preact"
    | "vanilla"
    | "elements"
    | "alpine"
    | "jquery"
    | "htmx";

export type AdapterCapability =
    "button" | "storeBind" | "form" | "field" | "input" | "auth" | "http";

export type AdapterManifest = {
    id: AdapterFrameworkId;
    packageName: string;
    capabilities: readonly AdapterCapability[];
};

export type ControlledValueContract<T> = {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
};

export type AdapterLifecycleContract = {
    dispose(): void;
};

export type AdapterSsrContract = {
    importTouchesWindow: false;
};

export const WAVE_A_MANIFESTS: readonly AdapterManifest[] = [
    {
        id: "react",
        packageName: "@sometic/react",
        capabilities: ["button", "storeBind", "form", "field", "input", "auth", "http"],
    },
    {
        id: "vue",
        packageName: "@sometic/vue",
        capabilities: ["button", "storeBind", "form", "field", "input", "auth", "http"],
    },
    {
        id: "vanilla",
        packageName: "@sometic/dom",
        capabilities: ["button", "storeBind", "field", "input"],
    },
    {
        id: "elements",
        packageName: "@sometic/elements",
        capabilities: ["button", "field", "input", "form", "auth"],
    },
] as const;

export const WAVE_B_MANIFESTS: readonly AdapterManifest[] = [
    {
        id: "angular",
        packageName: "@sometic/angular",
        capabilities: ["storeBind"],
    },
    {
        id: "svelte",
        packageName: "@sometic/svelte",
        capabilities: ["storeBind"],
    },
    {
        id: "solid",
        packageName: "@sometic/solid",
        capabilities: ["storeBind"],
    },
    {
        id: "preact",
        packageName: "@sometic/preact",
        capabilities: ["storeBind"],
    },
] as const;

export const WAVE_C_MANIFESTS: readonly AdapterManifest[] = [
    {
        id: "alpine",
        packageName: "@sometic/alpine",
        capabilities: ["storeBind", "button"],
    },
    {
        id: "jquery",
        packageName: "@sometic/jquery",
        capabilities: ["storeBind", "button"],
    },
    {
        id: "htmx",
        packageName: "@sometic/htmx",
        capabilities: ["storeBind", "button"],
    },
] as const;

export function assertManifestCapabilities(
    manifest: AdapterManifest,
    required: readonly AdapterCapability[],
): void {
    for (const capability of required) {
        if (!manifest.capabilities.includes(capability)) {
            throw new Error(`${manifest.packageName} does not claim capability "${capability}"`);
        }
    }
}

export function createStoreBindFixture<TState extends object>(
    initial: TState,
): {
    initial: TState;
    increments: number;
} {
    return { initial, increments: 3 };
}

export function createDisposeRebindFixture(): {
    bindCount: number;
    disposeCount: number;
} {
    return { bindCount: 0, disposeCount: 0 };
}

export function assertNoImportTimeWindowAccess(
    flag: AdapterSsrContract["importTouchesWindow"],
): void {
    if (flag !== false) {
        throw new Error("Adapters must not touch window at import time");
    }
}
