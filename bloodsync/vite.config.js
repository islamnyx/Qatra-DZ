import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
<<<<<<< HEAD
  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
=======
  resolve: {
    alias: {
      "@shared": path.resolve(root, "../shared"),
    },
  },
  server: { port: 5174, host: true },
>>>>>>> 97a94ceff93e73ab8f17d477cf3f4fae339acc64
});
