import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const mainlandBase = env.FOODMAP_MAINLAND_BASE_PATH?.trim() || "/";
  return {
    base: mode === "pages" ? "/foodMap/" : mode === "mainland" ? mainlandBase : "./",
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react";
            if (id.includes("node_modules/leaflet")) return "map";
            if (id.includes("node_modules/lucide-react")) return "icons";
          }
        }
      }
    },
    test: {
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
    },
    server: {
      port: 5173
    }
  };
});
