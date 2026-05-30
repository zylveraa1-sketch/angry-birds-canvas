import { defineConfig } from 'vite';
import { cpSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

/** Vite копирует только public/ — спрайты лежат в assets/sprites/ */
function copyGameAssets() {
  return {
    name: 'copy-game-assets',
    closeBundle() {
      const src = path.join(root, 'assets', 'sprites');
      const dest = path.join(root, 'dist', 'assets', 'sprites');
      if (!existsSync(src)) {
        console.warn('[copy-game-assets] нет папки assets/sprites');
        return;
      }
      mkdirSync(dest, { recursive: true });
      cpSync(src, dest, { recursive: true });
      console.log('[copy-game-assets] assets/sprites → dist/assets/sprites');
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/angry-birds-canvas/' : './',
  server: { port: 5173, open: true },
  plugins: [copyGameAssets()],
});
