import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: "127.0.0.1",
        port: 5212,
        strictPort: true,
    },
    preview: {
        host: "127.0.0.1",
        port: 5212,
        strictPort: true,
    },
});
