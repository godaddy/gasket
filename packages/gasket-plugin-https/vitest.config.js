import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['lib/**/*.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html', 'lcovonly'],
      // Cover executable JS only; index.d.ts is type declarations with no
      // runtime to exercise.
      include: ['lib/**/*.js'],
      exclude: ['**/node_modules/**', '**/test/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
