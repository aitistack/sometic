import type { Disposable } from "../disposable/index.js";

export type LifecyclePhase = "created" | "mounted" | "updated" | "unmounted" | "disposed";

export interface Lifecycle {
    readonly phase: LifecyclePhase;
}

export interface PluginContext<THost = unknown> {
    readonly host: THost;
    readonly registerDisposable: (disposable: Disposable | (() => void)) => void;
}

export interface Plugin<THost = unknown, TOptions = unknown> {
    readonly name: string;
    setup(context: PluginContext<THost>, options?: TOptions): void | Disposable | (() => void);
}

export interface AdapterContract<TInput, TOutput> {
    readonly name: string;
    adapt(input: TInput): TOutput;
}

export type MaybePromise<T> = T | Promise<T>;
