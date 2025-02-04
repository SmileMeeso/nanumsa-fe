import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), nodePolyfills()],
    resolve: {
        alias: [
            { find: "@api", replacement: "/src/api" },
            { find: "@components", replacement: "/src/components" },
            { find: "@", replacement: "/src" },
        ],
    },
});
