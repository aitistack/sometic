export function once<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
    let called = false;
    let value: TResult;

    return (...args: TArgs) => {
        if (!called) {
            called = true;
            value = fn(...args);
        }

        return value;
    };
}

export function debounce<TArgs extends unknown[]>(
    fn: (...args: TArgs) => void,
    waitMs: number,
): ((...args: TArgs) => void) & { cancel(): void; flush(): void } {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let latestArgs: TArgs | undefined;

    const debounced = ((...args: TArgs) => {
        latestArgs = args;
        if (timer !== undefined) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = undefined;
            const pending = latestArgs;
            latestArgs = undefined;
            if (pending) {
                fn(...pending);
            }
        }, waitMs);
    }) as ((...args: TArgs) => void) & { cancel(): void; flush(): void };

    debounced.cancel = () => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
        latestArgs = undefined;
    };

    debounced.flush = () => {
        if (timer === undefined) {
            return;
        }

        clearTimeout(timer);
        timer = undefined;
        const pending = latestArgs;
        latestArgs = undefined;
        if (pending) {
            fn(...pending);
        }
    };

    return debounced;
}

export function throttle<TArgs extends unknown[]>(
    fn: (...args: TArgs) => void,
    waitMs: number,
): ((...args: TArgs) => void) & { cancel(): void } {
    let lastInvoke = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let latestArgs: TArgs | undefined;

    const invoke = (time: number, args: TArgs): void => {
        lastInvoke = time;
        fn(...args);
    };

    const throttled = ((...args: TArgs) => {
        const now = Date.now();
        const remaining = waitMs - (now - lastInvoke);
        latestArgs = args;

        if (remaining <= 0 || remaining > waitMs) {
            if (timer !== undefined) {
                clearTimeout(timer);
                timer = undefined;
            }
            invoke(now, args);
            return;
        }

        if (timer === undefined) {
            timer = setTimeout(() => {
                timer = undefined;
                const pending = latestArgs;
                if (pending) {
                    invoke(Date.now(), pending);
                }
            }, remaining);
        }
    }) as ((...args: TArgs) => void) & { cancel(): void };

    throttled.cancel = () => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
        latestArgs = undefined;
    };

    return throttled;
}

export function shallowEqual(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) {
        return true;
    }

    if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) {
        return false;
    }

    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);

    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    for (const key of leftKeys) {
        if (
            !Object.prototype.hasOwnProperty.call(rightRecord, key) ||
            !Object.is(leftRecord[key], rightRecord[key])
        ) {
            return false;
        }
    }

    return true;
}

export type Deferred<T> = {
    readonly promise: Promise<T>;
    resolve(value: T | PromiseLike<T>): void;
    reject(reason?: unknown): void;
};

export function createDeferred<T>(): Deferred<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

export function anySignal(signals: readonly AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    const onAbort = (signal: AbortSignal): void => {
        controller.abort(signal.reason);
    };

    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort(signal.reason);
            return controller.signal;
        }

        signal.addEventListener(
            "abort",
            () => {
                onAbort(signal);
            },
            { once: true },
        );
    }

    return controller.signal;
}

export function normalizeError(value: unknown): Error {
    if (value instanceof Error) {
        return value;
    }

    if (typeof value === "string") {
        return new Error(value);
    }

    try {
        return new Error(JSON.stringify(value));
    } catch {
        return new Error(String(value));
    }
}

export function safeJsonParse<T = unknown>(value: string): T | undefined {
    try {
        return JSON.parse(value) as T;
    } catch {
        return undefined;
    }
}

export function safeJsonStringify(value: unknown): string | undefined {
    try {
        return JSON.stringify(value);
    } catch {
        return undefined;
    }
}
