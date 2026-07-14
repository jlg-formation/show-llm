import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// base '/show-llm/' pour un déploiement sous https://jlg-formation.github.io/show-llm/
export default defineConfig({
  base: "/show-llm/",
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  build: {
    target: "esnext",
    outDir: "dist"
  }
});
