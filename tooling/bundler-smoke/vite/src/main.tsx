import { createId } from "@sometic/core/id";
import { createHttp } from "@sometic/http";
import { createHeadController, serializeHead } from "@sometic/head";
import { Button } from "@sometic/react/button";

export function App() {
    const http = createHttp({ baseUrl: "https://example.test" });
    const head = createHeadController({ initial: { title: "Smoke" } });
    void http;
    void serializeHead(head.get());
    return <Button type="button">{createId()}</Button>;
}
