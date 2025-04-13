import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.mjs';
        if (format === 'cjs') return 'index.cjs';
        return `index.${format}.js`;
      }
    },
    rollupOptions: {
      external: ['@gasket/request']
    },
    outDir: 'dist',
    target: 'esnext',
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['**/*-browser.test.ts', 'jsdom']
    ]
  }
});
