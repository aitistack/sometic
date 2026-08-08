import { describe, expect, it, vi } from "vitest";
import {
    bindJQueryButton,
    createJQueryStoreBind,
    registerJQueryAdapters,
    type JQueryInstanceLike,
    type JQueryStaticLike,
} from "./index.js";

function createFakeJQuery(elements: HTMLElement[]): JQueryStaticLike {
    const instance: JQueryInstanceLike = {
        each(callback) {
            elements.forEach((element, index) => {
                callback.call(element, index);
            });
            return instance;
        },
        data(key: string, value?: unknown) {
            void key;
            void value;
            return undefined;
        },
    };
    const $ = ((element: Element) => {
        void element;
        return instance;
    }) as JQueryStaticLike;
    $.fn = {};
    return $;
}

describe("@sometic/jquery", () => {
    it("updates and disposes store bind", () => {
        const bind = createJQueryStoreBind({ count: 0 });
        bind.update((state) => ({ count: state.count + 1 }));
        expect(bind.get().count).toBe(1);
        bind.dispose();
    });

    it("replaces prior button binding and destroys via plugin", () => {
        const button = document.createElement("button");
        document.body.append(button);
        const first = vi.fn();
        const second = vi.fn();
        bindJQueryButton(button, () => ({ onPress: first }));
        bindJQueryButton(button, () => ({ onPress: second }));
        button.click();
        expect(first).toHaveBeenCalledTimes(0);
        expect(second).toHaveBeenCalledTimes(1);

        const $ = createFakeJQuery([button]);
        registerJQueryAdapters($);
        const plugin = $.fn.someticButton as (
            this: JQueryInstanceLike,
            command?: unknown,
        ) => JQueryInstanceLike;
        plugin.call($(button), "destroy");
        button.click();
        expect(second).toHaveBeenCalledTimes(1);
        button.remove();
    });
});
