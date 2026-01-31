import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ mode }) => {
  return {
    // Si estás en tu PC (development), activa HTTPS. En Vercel, no.
    server: mode === "development" ? { https: true } : {},
    plugins: [
      react(),
      // Solo carga mkcert si estás en tu PC
      mode === "development" ? mkcert() : null,
    ].filter(Boolean),
  };
});