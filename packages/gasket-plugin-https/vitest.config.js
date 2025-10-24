import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html', 'lcovonly'],
      include: ['lib/**'],
      exclude: ['**/node_modules/**', '**/test/**']
    }
  }
});
