import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Renderer build. Run with `vite build` / `vite dev` (this is the default config file).
export default defineConfig({
  root: 'src/renderer',
  build: {
    outDir: resolve('out/renderer'),
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '#': resolve('src/renderer/src'),
      '@/resources': resolve('resources')
    }
  },
  server: {
    fs: {
      allow: [resolve('.'), resolve('resources')]
    }
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: resolve('src/renderer/src/routes'),
      generatedRouteTree: resolve('src/renderer/src/routeTree.gen.ts'),
      quoteStyle: 'single',
      semicolons: false
    }),
    react(),
    tailwindcss()
  ]
});
