import { bindAlpineButton, createAlpineStoreBind } from "@sometic/alpine";
import "./styles.css";

const app = document.querySelector("#app");
if (!(app instanceof HTMLElement)) {
    throw new Error("Missing #app");
}

const store = createAlpineStoreBind({ count: 0 });
const status = document.createElement("p");
const button = document.createElement("button");
button.type = "button";
button.textContent = "Increment";

const render = (): void => {
    status.textContent = `Count: ${String(store.get().count)} · Alpine cleanup-ready bind`;
};

const binding = bindAlpineButton(button, () => ({
    onPress: () => {
        store.update((state) => ({ count: state.count + 1 }));
        render();
    },
}));

const destroy = document.createElement("button");
destroy.type = "button";
destroy.textContent = "Dispose binding";
destroy.addEventListener("click", () => {
    binding.dispose();
    status.textContent = `Disposed · count frozen at ${String(store.get().count)}`;
});

app.append(
    Object.assign(document.createElement("h1"), { textContent: "Sometic Alpine playground" }),
    Object.assign(document.createElement("p"), {
        textContent:
            "Demonstrates store bind + button bind with explicit dispose (Alpine cleanup).",
    }),
    button,
    destroy,
    status,
);
render();
