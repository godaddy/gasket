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
      // runtime to exercise. Matches the convention in sibling plugins.
      include: ['lib/**/*.js'],
      exclude: ['**/node_modules/**', '**/test/**']
    }
  }
});
