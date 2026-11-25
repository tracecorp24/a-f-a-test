import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: { "/v1": process.env.ARENA_API_URL ?? "http://127.0.0.1:8080" },
  },
});
