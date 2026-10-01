import { defineConfig, globalIgnores } from 'eslint/config';
import godaddyReact from 'eslint-config-godaddy-react';
import next from 'eslint-config-next';
import reactIntl from '@godaddy/eslint-plugin-react-intl';
import typescriptParser from '@typescript-eslint/parser';

// eslint-config-next registers the react, react-hooks and jsx-a11y plugins itself.
// Drop the copies eslint-config-godaddy-react registers so ESLint does not see two
// instances of the same plugin name; the godaddy rules still apply through next's.
const nextPlugins = new Set(['react', 'react-hooks', 'jsx-a11y']);
const godaddyReactRules = godaddyReact.map(({ plugins, ...config }) => {
  if (!plugins) return config;
  const rest = Object.fromEntries(
    Object.entries(plugins).filter(([name]) => !nextPlugins.has(name))
  );
  return Object.keys(rest).length ? { ...config, plugins: rest } : config;
});

export default defineConfig([
  ...godaddyReactRules,
  ...next,
  globalIgnores(['dist/', 'coverage/', 'build/', 'next-env.d.ts']),
  {
    plugins: {
      '@godaddy/react-intl': reactIntl
    },
    rules: reactIntl.configs.recommended.rules,
    settings: {
      localeFiles: ['locales/en-US.json']
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser
    }
  }
]);
