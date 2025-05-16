import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // Import 'path' module

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [
      "team76.bham.team",
      "team76.dev.bham.team",
      "studyo.bham.team",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Define @/ alias
    },
  },
  plugins: [react(), tailwindcss()],
});
