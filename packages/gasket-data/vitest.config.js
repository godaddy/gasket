import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}']
  }
});
