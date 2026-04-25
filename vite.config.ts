import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { defineConfig, loadEnv } from "vite";

function characterPlugin() {
  const virtualModuleId = "virtual:characters";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "character-plugin",
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const charactersDir = path.resolve(__dirname, "characters");
        let files: string[] = [];
        try {
          files = fs
            .readdirSync(charactersDir)
            .filter((f) => f.endsWith(".json"));
        } catch (e) {
          console.warn("Could not read characters folder");
        }

        const characters = files.map((file) => {
          const filePath = path.join(charactersDir, file);
          const stat = fs.statSync(filePath);
          let charName = file.replace(".json", "");
          let idName = charName;
          try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            if (data.name) charName = data.name;
          } catch (e) {}

          return {
            filename: file,
            id: file.replace(".json", ""),
            name: charName,
            updatedAt: stat.mtime.toISOString(),
          };
        });

        return `export const characters = ${JSON.stringify(characters)};`;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "./",
    plugins: [react(), tailwindcss(), characterPlugin()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
    },
  };
});
