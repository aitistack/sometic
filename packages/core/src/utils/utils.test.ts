import { afterEach, describe, expect, it, vi } from "vitest";
import {
    anySignal,
    createDeferred,
    debounce,
    normalizeError,
    once,
    safeJsonParse,
    safeJsonStringify,
    shallowEqual,
    throttle,
} from "./index.js";

describe("utils", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("invokes once only one time", () => {
        const fn = vi.fn((value: number) => value * 2);
        const wrapped = once(fn);
        expect(wrapped(2)).toBe(4);
        expect(wrapped(9)).toBe(4);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("debounces calls and supports cancel/flush", () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const debounced = debounce(fn, 100);
        debounced("a");
        debounced("b");
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("b");

        debounced("c");
        debounced.cancel();
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);

        debounced("d");
        debounced.flush();
        expect(fn).toHaveBeenLastCalledWith("d");
    });

    it("throttles rapid calls", () => {
        vi.useFakeTimers();
        const fn = vi.fn();
        const throttled = throttle(fn, 100);
        throttled("a");
        throttled("b");
        expect(fn).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("compares values shallowly", () => {
        expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
        expect(shallowEqual(1, 1)).toBe(true);
    });

    it("composes abort signals", () => {
        const left = new AbortController();
        const right = new AbortController();
        const signal = anySignal([left.signal, right.signal]);
        expect(signal.aborted).toBe(false);
        right.abort("reason");
        expect(signal.aborted).toBe(true);
    });

    it("normalizes and safely serializes values", async () => {
        expect(normalizeError("x")).toBeInstanceOf(Error);
        expect(safeJsonParse<number>("1")).toBe(1);
        expect(safeJsonParse("nope")).toBeUndefined();
        expect(safeJsonStringify({ a: 1 })).toBe('{"a":1}');

        const deferred = createDeferred<number>();
        deferred.resolve(5);
        await expect(deferred.promise).resolves.toBe(5);
    });
});
