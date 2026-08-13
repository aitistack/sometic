import { registerAuthElements } from "./auth/index.js";
import { registerButtonElements } from "./button/index.js";
import { registerFormElements } from "./form/index.js";
import { registerInputElements } from "./input/index.js";
import { registerOverlayElements } from "./overlay/index.js";
import { registerSelectionElements } from "./selection/index.js";
import { registerStructureElements } from "./structure/index.js";

export function register(): void {
    registerButtonElements();
    registerInputElements();
    registerFormElements();
    registerAuthElements();
    registerSelectionElements();
    registerOverlayElements();
    registerStructureElements();
}

register();

export const SometicElements = {
    register,
};
