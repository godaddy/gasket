import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}'],
    setupFiles: ['test/setup.js']
  }
});

