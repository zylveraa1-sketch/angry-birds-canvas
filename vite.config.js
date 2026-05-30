import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/angry-birds-canvas/' : './',
  server: { port: 5173, open: true },
});
