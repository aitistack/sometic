export {
    canUseDom,
    detectRuntimeCapabilities,
    getGlobalThis,
    isBrowserEnvironment,
    isServerEnvironment,
} from "./environment/index.js";
export type { GlobalThisLike, RuntimeCapabilities } from "./environment/index.js";

export { createId, createPrefixedId } from "./id/index.js";

export { createDisposable, DisposableStack } from "./disposable/index.js";
export type { Disposable, DisposeFn } from "./disposable/index.js";

export { SometicError, createError, isSometicError } from "./error/index.js";
export type { SometicErrorOptions } from "./error/index.js";

export { err, isErr, isOk, mapResult, ok, unwrap } from "./result/index.js";
export type { ErrResult, OkResult, Result } from "./result/index.js";

export type {
    AdapterContract,
    Lifecycle,
    LifecyclePhase,
    MaybePromise,
    Plugin,
    PluginContext,
} from "./contracts/index.js";

export { createControllableState } from "./controllable-state/index.js";
export type { ControllableState, ControllableStateOptions } from "./controllable-state/index.js";

export { createAsyncOperation } from "./async-operation/index.js";
export type {
    AsyncOperationController,
    AsyncOperationOptions,
    AsyncOperationState,
    AsyncOperationStatus,
} from "./async-operation/index.js";

export {
    anySignal,
    createDeferred,
    debounce,
    normalizeError,
    once,
    safeJsonParse,
    safeJsonStringify,
    shallowEqual,
    throttle,
} from "./utils/index.js";
export type { Deferred } from "./utils/index.js";
