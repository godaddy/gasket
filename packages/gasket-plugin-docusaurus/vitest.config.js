import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}']
  },
  resolve: {
    alias: {
      '@docusaurus/core': '@docusaurus/core/lib/index.js'
    }
  }
});
