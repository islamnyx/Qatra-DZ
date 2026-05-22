import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@qatra/map-utils": path.resolve(root, "../src/features/map/utils"),
      "@qatra/map-data": path.resolve(root, "../src/features/map/data"),
    },
  },
  server: { port: 5174, host: true },
});
