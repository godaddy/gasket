import { defineConfig, defaultExclude } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({
    root: '.',
    loose: true
  })],
  test: {
    exclude: [...defaultExclude],
    coverage: {
      all: true,
      provider: 'v8',
      enabled: true,
      include: ['src/**/*'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.config.*',
        '**/*.d.ts',
        '**/*.map',
        '**/lib/**',
        '**/dist/**',
        '**/cjs/**',
        '**/coverage/**'
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        'autoUpdate': false,
        'perFile': true,
        'src/**/*.{ts,tsx}': {
          statements: 80,
          functions: 80,
          branches: 80,
          lines: 80
        }
      }
    }
  }
} satisfies ReturnType<typeof defineConfig>);
