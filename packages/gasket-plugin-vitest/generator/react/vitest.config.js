import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
{{#if typescript}}
import tsConfigPaths from 'vite-tsconfig-paths';
{{/if}}

export default defineConfig({
  plugins: [
    react(),
    {{#if typescript}}
    tsConfigPaths()
    {{/if}}
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
