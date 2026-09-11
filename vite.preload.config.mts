import { builtinModules } from 'module';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

const nodeBuiltins = builtinModules.flatMap((m) => [m, `node:${m}`]);

// Preload script build. Run with `vite build --config vite.preload.config.mts`.
export default defineConfig({
  build: {
    outDir: resolve('out/preload'),
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve('src/preload/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js'
    },
    rolldownOptions: {
      external: ['electron', ...nodeBuiltins, ...Object.keys(pkg.dependencies)]
    }
  }
});
