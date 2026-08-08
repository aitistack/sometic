import { bindJQueryButton, createJQueryStoreBind } from "@sometic/jquery";
import "./styles.css";

const app = document.querySelector("#app");
if (!(app instanceof HTMLElement)) {
    throw new Error("Missing #app");
}

const store = createJQueryStoreBind({ count: 0 });
const status = document.createElement("p");
const button = document.createElement("button");
button.type = "button";
button.textContent = "Increment";

const render = (): void => {
    status.textContent = `Count: ${String(store.get().count)} · jQuery destroy-ready bind`;
};

let binding = bindJQueryButton(button, () => ({
    onPress: () => {
        store.update((state) => ({ count: state.count + 1 }));
        render();
    },
}));

const destroy = document.createElement("button");
destroy.type = "button";
destroy.textContent = "Destroy";
destroy.addEventListener("click", () => {
    binding.dispose();
    status.textContent = `Destroyed · clicks no longer increment (count=${String(store.get().count)})`;
});

const rebind = document.createElement("button");
rebind.type = "button";
rebind.textContent = "Re-bind";
rebind.addEventListener("click", () => {
    binding = bindJQueryButton(button, () => ({
        onPress: () => {
            store.update((state) => ({ count: state.count + 1 }));
            render();
        },
    }));
    render();
});

app.append(
    Object.assign(document.createElement("h1"), { textContent: "Sometic jQuery playground" }),
    Object.assign(document.createElement("p"), {
        textContent: "Demonstrates store bind + button bind with destroy / re-bind cleanup.",
    }),
    button,
    destroy,
    rebind,
    status,
);
render();
