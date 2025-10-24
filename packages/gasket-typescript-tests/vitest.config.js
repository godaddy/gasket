import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true
  },
  resolve: {
    alias: {
      // Mock docusaurus dependencies that aren't installed in test environment
      '@docusaurus/core': new URL('./test/__mocks__/docusaurus-core.js', import.meta.url).pathname,
      '@docusaurus/core/package.json': new URL('./test/__mocks__/docusaurus-core-package.json', import.meta.url).pathname,
      '@docusaurus/preset-classic': new URL('./test/__mocks__/docusaurus-preset-classic.js', import.meta.url).pathname
    }
  }
});

