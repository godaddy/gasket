import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true
  },
  optimizeDeps: {
    include: ['happy-feet']
  },
  ssr: {
    noExternal: ['happy-feet']
  }
});
