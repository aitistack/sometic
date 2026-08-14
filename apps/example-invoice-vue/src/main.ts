import { createApp, defineComponent, h } from "vue";
import { applyThemeToElement } from "@sometic/theme";
import { provideQueryClient } from "@sometic/vue/query";
import { createInvoiceDeskRuntime } from "@sometic/example-invoice-kit";
import App from "./App.vue";
import "./desk.css";

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

const Root = defineComponent({
    setup() {
        provideQueryClient(runtime.app.query);
        return () => h(App, { runtime });
    },
});

createApp(Root).mount("#app");
