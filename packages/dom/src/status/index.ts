import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type StatusKind = "empty" | "error" | "offline" | "conflict";

export type ResolveStatusOptions = StyleableProps<"root" | "title" | "description" | "actions"> & {
    kind: StatusKind;
    title?: string;
    description?: string;
    hasAction?: boolean;
    live?: "polite" | "assertive" | "off";
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type StatusViewModel = {
    kind: StatusKind;
    title: string | undefined;
    description: string | undefined;
    hasAction: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

const DEFAULT_TITLES: Record<StatusKind, string> = {
    empty: "Nothing here yet",
    error: "Something went wrong",
    offline: "You are offline",
    conflict: "Conflicting changes",
};

export function resolveStatus(options: ResolveStatusOptions): StatusViewModel {
    const kind = options.kind;
    const hasAction = options.hasAction === true;
    const live = options.live ?? (kind === "error" || kind === "conflict" ? "assertive" : "polite");
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    const title = options.title ?? DEFAULT_TITLES[kind];
    return {
        kind,
        title,
        description: options.description,
        hasAction,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: kind === "error" || kind === "conflict" ? "alert" : "status",
            "data-slot": "root",
            "data-status": kind,
            "data-has-action": hasAction ? "true" : "false",
            ...(live === "off" ? {} : { "aria-live": live }),
        },
    };
}

export type ResolveStatusActionOptions = StyleableProps<"root"> & {
    disabled?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type StatusActionViewModel = {
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveStatusAction(
    options: ResolveStatusActionOptions = {},
): StatusActionViewModel {
    const disabled = options.disabled === true;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            type: "button",
            "data-slot": "action",
            ...(disabled ? { disabled: "", "aria-disabled": "true" } : {}),
        },
    };
}

export type ConflictVersions = {
    localLabel?: string;
    remoteLabel?: string;
};

export type ResolveConflictStatusOptions = ResolveStatusOptions & {
    versions?: ConflictVersions;
};

export type ConflictStatusViewModel = StatusViewModel & {
    localLabel: string;
    remoteLabel: string;
};

export function resolveConflictStatus(
    options: ResolveConflictStatusOptions,
): ConflictStatusViewModel {
    const base = resolveStatus({ ...options, kind: "conflict" });
    return {
        ...base,
        localLabel: options.versions?.localLabel ?? "Your version",
        remoteLabel: options.versions?.remoteLabel ?? "Server version",
    };
}

export type OfflineRecoveryOptions = {
    onOnline?: () => void;
    addEventListener?: (
        type: "online",
        listener: () => void,
        options?: { signal?: AbortSignal },
    ) => void;
    signal?: AbortSignal;
};

export function bindOfflineRecovery(options: OfflineRecoveryOptions = {}): () => void {
    const onOnline = options.onOnline;
    if (!onOnline) {
        return () => {};
    }
    const add =
        options.addEventListener ??
        ((type, listener, listenerOptions) => {
            if (typeof globalThis.addEventListener !== "function") {
                return;
            }
            globalThis.addEventListener(type, listener, listenerOptions);
        });
    const controller = new AbortController();
    const signal = options.signal;
    if (signal) {
        if (signal.aborted) {
            return () => {};
        }
        signal.addEventListener(
            "abort",
            () => {
                controller.abort();
            },
            { once: true },
        );
    }
    add("online", onOnline, { signal: controller.signal });
    return () => {
        controller.abort();
    };
}
