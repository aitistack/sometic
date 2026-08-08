import { bindHtmxButton, createHtmxBinderRoot, createHtmxStoreBind } from "@sometic/htmx";
import "./styles.css";

const app = document.querySelector("#app");
if (!(app instanceof HTMLElement)) {
    throw new Error("Missing #app");
}

const store = createHtmxStoreBind({ presses: 0 });
const status = document.createElement("p");
const swapHost = document.createElement("div");
swapHost.id = "swap-host";

const mountButton = (): void => {
    swapHost.replaceChildren();
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-sometic-button", "");
    button.textContent = "Press";
    swapHost.append(button);
};

mountButton();

const root = createHtmxBinderRoot(app);
root.register({
    selector: "[data-sometic-button]",
    bind: (element) => {
        if (!(element instanceof HTMLButtonElement)) {
            return {
                get disposed() {
                    return true;
                },
                dispose() {},
            };
        }
        return bindHtmxButton(element, () => ({
            onPress: () => {
                store.update((state) => ({ presses: state.presses + 1 }));
                status.textContent = `Presses: ${String(store.get().presses)} · single active listener`;
            },
        }));
    },
});

const simulateSwap = document.createElement("button");
simulateSwap.type = "button";
simulateSwap.textContent = "Simulate HTMX swap";
simulateSwap.addEventListener("click", () => {
    mountButton();
    app.dispatchEvent(new Event("htmx:afterSettle", { bubbles: true }));
    status.textContent = `Swapped · presses=${String(store.get().presses)} · re-bound without stacking`;
});

app.append(
    Object.assign(document.createElement("h1"), { textContent: "Sometic HTMX playground" }),
    Object.assign(document.createElement("p"), {
        textContent: "Simulates afterSettle re-init so swapped buttons keep a single listener.",
    }),
    swapHost,
    simulateSwap,
    status,
);

status.textContent = "Ready · press the button, then simulate a swap";
