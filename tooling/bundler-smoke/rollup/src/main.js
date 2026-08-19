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
export const id = createId();
export const tags = serializeHead(head.get());
export { http, store, events, auth };
