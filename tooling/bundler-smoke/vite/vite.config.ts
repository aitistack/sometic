import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "dist",
        lib: {
            entry: "src/main.tsx",
            formats: ["es"],
            fileName: "main",
        },
        rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime", "vue"],
        },
    },
});
