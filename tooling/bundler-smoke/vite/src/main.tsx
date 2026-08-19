import { createId } from "@sometic/core/id";
import { createEventEmitter } from "@sometic/events";
import { createHttp } from "@sometic/http";
import { createHeadController, serializeHead } from "@sometic/head";
import { createStore } from "@sometic/store";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
} from "@sometic/auth";
import { Button } from "@sometic/react/button";
import { Button as VueButton } from "@sometic/vue/button";

export function App() {
    const http = createHttp({ baseUrl: "https://example.test" });
    const head = createHeadController({ initial: { title: "Smoke" } });
    const store = createStore({ n: 0 });
    const events = createEventEmitter();
    const auth = createAuth({
        provider: createTestAuthProvider(),
        storage: createMemoryAuthStorage(),
        crossTab: createNoopAuthBus(),
        environment: false,
    });
    void http;
    void store;
    void events;
    void auth;
    void VueButton;
    void serializeHead(head.get());
    return <Button type="button">{createId()}</Button>;
}
