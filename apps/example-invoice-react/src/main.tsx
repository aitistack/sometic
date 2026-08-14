import { createRoot } from "react-dom/client";
import { applyThemeToElement } from "@sometic/theme";
import { createInvoiceDeskRuntime } from "@sometic/example-invoice-kit";
import { App } from "./App.js";
import "./styles.css";

const runtime = createInvoiceDeskRuntime();
const theme = runtime.app.theme;
if (theme) {
    theme.setMode("light");
    applyThemeToElement(document.documentElement, theme.get());
    theme.subscribe((snapshot) => {
        applyThemeToElement(document.documentElement, snapshot);
    });
}

window.addEventListener("pagehide", () => {
    runtime.dispose();
});

const root = document.getElementById("root");
if (root) {
    createRoot(root).render(<App runtime={runtime} />);
}
