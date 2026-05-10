import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

const workspaceAliases = {
  "@autopet/pet-engine": resolve(workspaceRoot, "packages/pet-engine/src/index.ts"),
  "@autopet/pet-format": resolve(workspaceRoot, "packages/pet-format/src/index.ts")
};

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: workspaceAliases
    },
    plugins: [react()]
  }
});
