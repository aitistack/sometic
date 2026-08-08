import { createId } from "@sometic/core/id";
import { createHttp } from "@sometic/http";
import { createHeadController, serializeHead } from "@sometic/head";

const http = createHttp({ baseUrl: "https://example.test" });
const head = createHeadController({ initial: { title: "Smoke" } });
export const id = createId();
export const tags = serializeHead(head.get());
export { http };
