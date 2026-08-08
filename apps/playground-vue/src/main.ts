import { createApp, defineComponent, h, ref } from "vue";
import { AsyncButton, Button } from "@sometic/vue/button";
import { useStore } from "@sometic/vue/store";
import { createStore } from "@sometic/store";
import "./styles.css";

const counter = createStore({ count: 0 });

const App = defineComponent({
    setup() {
        const count = useStore(counter, (state) => state.count);
        const message = ref("Ready");
        return () =>
            h("main", null, [
                h("h1", null, "Sometic Vue playground"),
                h("p", null, `Count: ${count.value}`),
                h("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" } }, [
                    h(
                        Button,
                        {
                            type: "button",
                            onClick: () => counter.update((state) => ({ count: state.count + 1 })),
                        },
                        () => "Increment",
                    ),
                    h(
                        AsyncButton,
                        {
                            action: async () => {
                                await new Promise((resolve) => setTimeout(resolve, 200));
                                message.value = "Async complete";
                            },
                        },
                        () => "Async action",
                    ),
                ]),
                h("p", null, message.value),
            ]);
    },
});

createApp(App).mount("#app");
