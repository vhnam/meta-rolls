import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (shared/, and eventually main-process services
// with no Electron dependency). Renderer components have their own concerns
// (DOM, Electron APIs via window.api) that aren't covered by this config.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['shared/**/*.test.ts', 'src/main/**/*.test.ts']
  }
});
