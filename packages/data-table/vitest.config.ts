import { createVitestConfig } from "@sometic/testing-config/vitest";

export default createVitestConfig({
    test: {
        environment: "happy-dom",
    },
});
