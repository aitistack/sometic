import {
    canUseDom,
    createId,
    getGlobalThis,
    isBrowserEnvironment,
    isServerEnvironment,
} from "../../../packages/core/dist/index.js";
import { createEventEmitter } from "../../../packages/events/dist/index.js";
import { createStore } from "../../../packages/store/dist/index.js";
import { resolveClasses, resolveStyleable } from "../../../packages/styling/dist/index.js";
import { createThemeController } from "../../../packages/theme/dist/index.js";
import { lightTheme } from "../../../packages/theme/dist/presets/index.js";
import { createFocusTrap, matchesKey } from "../../../packages/accessibility/dist/index.js";
import { resolveButton } from "../../../packages/dom/dist/button/index.js";

/** @type {import("@sometic/core").GlobalThisLike} */
const globalRef = getGlobalThis();

if (globalRef !== globalThis) {
    throw new Error("getGlobalThis mismatch");
}

if (typeof isServerEnvironment() !== "boolean") {
    throw new Error("isServerEnvironment type mismatch");
}

if (typeof isBrowserEnvironment() !== "boolean") {
    throw new Error("isBrowserEnvironment type mismatch");
}

if (typeof canUseDom() !== "boolean") {
    throw new Error("canUseDom type mismatch");
}

if (typeof createId() !== "string") {
    throw new Error("createId type mismatch");
}

const emitter = createEventEmitter();
if (emitter.listenerCount("x") !== 0) {
    throw new Error("events mismatch");
}

const store = createStore(0);
if (store.get() !== 0) {
    throw new Error("store mismatch");
}

if (resolveClasses("a", { b: true }) !== "a b") {
    throw new Error("styling classes mismatch");
}

const styled = resolveStyleable({
    defaults: { className: "btn" },
    user: { className: "x" },
});
if (styled.className !== "btn x") {
    throw new Error("styling resolveStyleable mismatch");
}

const theme = createThemeController({
    themes: [lightTheme],
    defaultThemeId: "light",
    mode: "light",
});
if (theme.get().resolvedThemeId !== "light") {
    throw new Error("theme controller mismatch");
}
theme.dispose();

if (typeof createFocusTrap !== "function") {
    throw new Error("accessibility createFocusTrap mismatch");
}

if (typeof matchesKey !== "function") {
    throw new Error("accessibility matchesKey mismatch");
}

if (resolveButton({ loading: true }).attributes["aria-busy"] !== "true") {
    throw new Error("dom resolveButton mismatch");
}

console.log("javascript consumer smoke: ok");
