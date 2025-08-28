import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}']
  }
});

