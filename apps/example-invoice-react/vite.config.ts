import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [tailwindcss(), react()],
    server: {
        host: "127.0.0.1",
        port: 5210,
        strictPort: true,
    },
    preview: {
        host: "127.0.0.1",
        port: 5210,
        strictPort: true,
    },
});
