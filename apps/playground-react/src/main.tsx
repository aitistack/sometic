import { createRoot } from "react-dom/client";
import { createElement, useState } from "react";
import { Button, AsyncButton } from "@sometic/react/button";
import { useStore } from "@sometic/react/store";
import { createStore } from "@sometic/store";
import "./styles.css";

const counter = createStore({ count: 0 });

function App() {
    const count = useStore(counter, (state) => state.count);
    const [message, setMessage] = useState("Ready");
    return createElement(
        "main",
        null,
        createElement("h1", null, "Sometic React playground"),
        createElement("p", null, `Count: ${count}`),
        createElement(
            "div",
            { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" } },
            createElement(
                Button,
                {
                    type: "button",
                    onClick: () => counter.update((state) => ({ count: state.count + 1 })),
                },
                "Increment",
            ),
            createElement(
                AsyncButton,
                {
                    action: async () => {
                        await new Promise((resolve) => setTimeout(resolve, 200));
                        setMessage("Async complete");
                    },
                },
                "Async action",
            ),
        ),
        createElement("p", null, message),
    );
}

const root = document.getElementById("root");
if (root) {
    createRoot(root).render(createElement(App));
}
