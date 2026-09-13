import { builtinModules } from 'module';
import { resolve } from 'path';

import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const nodeBuiltins = builtinModules.flatMap((m) => [m, `node:${m}`]);

// Main process build. Run with `vite build --config vite.main.config.mts`.
export default defineConfig({
  build: {
    outDir: resolve('out/main'),
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    // Electron bundles a single, always-current Node — no need to down-level.
    target: 'esnext',
    lib: {
      entry: resolve('src/main/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js'
    },
    rolldownOptions: {
      external: [
        'electron',
        'sqlite',
        'node:sqlite',
        ...nodeBuiltins,
        ...Object.keys(pkg.dependencies)
      ]
    }
  }
});
