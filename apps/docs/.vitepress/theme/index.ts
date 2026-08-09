import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import CopyPrompt from "./components/CopyPrompt.vue";
import DemoFrame from "./components/DemoFrame.vue";
import InstallCommands from "./components/InstallCommands.vue";
import { previewComponents } from "./previews/index";
import "@sometic/demo-kit/typography.css";
import "@sometic/demo-kit/controls.css";
import "./custom.css";
import "./demo.css";
import "./home.css";

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component("CopyPrompt", CopyPrompt);
        app.component("DemoFrame", DemoFrame);
        app.component("InstallCommands", InstallCommands);
        // Preview* use defineAsyncComponent — chunks load only when a page mounts them.
        for (const [name, component] of Object.entries(previewComponents)) {
            app.component(name, component);
        }
    },
};
