import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.js'],
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}'],
    setupFiles: []
  }
});
