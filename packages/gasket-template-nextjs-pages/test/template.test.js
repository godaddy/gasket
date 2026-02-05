import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templateDir = join(__dirname, '..', 'template');

describe('@gasket/template-nextjs-pages', () => {
  describe('template structure', () => {
    it('should have all required files', () => {
      const requiredFiles = [
        'package.json',
        'gasket.ts',
        'server.ts',
        'intl.ts',
        'next.config.js',
        'next-env.d.ts',
        'tsconfig.json',
        'tsconfig.server.json',
        'vitest.config.js',
        'README.md',
        'pages/_app.tsx',
        'pages/_document.ts',
        'pages/index.tsx',
        'components/head.tsx',
        'locales/en-US.json',
        'locales/fr-FR.json',
        'test/index.test.tsx'
      ];

      requiredFiles.forEach(file => {
        const filePath = join(templateDir, file);
        expect(existsSync(filePath), `${file} should exist`).toBe(true);
      });
    });

    it('should have valid package.json', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.name).toBe('{{{appName}}}');
      expect(packageJson.description).toBe('Gasket App');
      expect(packageJson.version).toBe('0.0.0');
      expect(packageJson.type).toBe('module');
    });

    it('should have correct scripts', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBe('npm run build:tsc && next build --webpack');
      expect(packageJson.scripts.start).toBe('npm run start:https & next start');
      expect(packageJson.scripts.local).toBe('concurrently "npm run build:tsc:watch" "npm run local:https" "next dev --webpack"');
      expect(packageJson.scripts.test).toBe('vitest run');
      expect(packageJson.scripts['test:watch']).toBe('vitest');
      expect(packageJson.scripts['test:coverage']).toBe('vitest run --coverage');
      expect(packageJson.scripts.lint).toBe('eslint --ext .js,.jsx,.cjs,.ts,.tsx .');
      expect(packageJson.scripts['lint:fix']).toBe('npm run lint -- --fix');
      expect(packageJson.scripts.posttest).toBe('npm run lint');
    });

    it('should have correct dependencies', () => {
      const requiredDependencies = [
        '@gasket/core',
        '@gasket/plugin-command',
        '@gasket/plugin-dynamic-plugins',
        '@gasket/plugin-https-proxy',
        '@gasket/plugin-intl',
        '@gasket/plugin-logger',
        '@gasket/plugin-nextjs',
        '@gasket/plugin-webpack',
        '@gasket/plugin-winston',
        '@gasket/request',
        '@gasket/utils',
        '@types/react',
        'next',
        'react',
        'react-dom',
        'react-intl',
        'tsx',
        'typescript',
        'winston'
      ];

      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      requiredDependencies.forEach(dependency => {
        expect(packageJson.dependencies).toHaveProperty(dependency);
      });
    });

    it('should have correct devDependencies', () => {
      const requiredDevDependencies = [
        '@babel/core',
        '@docusaurus/core',
        '@docusaurus/preset-classic',
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        '@godaddy/eslint-plugin-react-intl',
        '@testing-library/dom',
        '@testing-library/react',
        '@typescript-eslint/parser',
        '@vitejs/plugin-react',
        '@vitest/coverage-v8',
        'ajv',
        'concurrently',
        'eslint',
        'eslint-config-godaddy-react',
        'eslint-config-next',
        'eslint-plugin-react-hooks',
        'jsdom',
        'search-insights',
        'typescript',
        'vitest',
        'webpack'
      ];

      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      const checkDevDependency = (dependency) => {
        expect(packageJson.devDependencies).toHaveProperty(dependency);
      };

      requiredDevDependencies.forEach(checkDevDependency);
    });

    it('should have correct ESLint configuration', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.eslintConfig).toBeDefined();
      expect(packageJson.eslintConfig.extends).toEqual([
        'godaddy-react',
        'plugin:@godaddy/react-intl/recommended',
        'next'
      ]);
      expect(packageJson.eslintConfig.parser).toBe('@typescript-eslint/parser');
      expect(packageJson.eslintConfig.settings.localeFiles).toEqual(['locales/en-US.json']);
      expect(packageJson.eslintIgnore).toEqual(['dist', 'coverage/', 'build/', 'next-env.d.ts']);
    });
  });

  describe('typescript configuration', () => {
    it('should have valid tsconfig.json', () => {
      const tsconfigPath = join(templateDir, 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.target).toBe('ESNext');
      expect(tsconfig.compilerOptions.module).toBe('ESNext');
      expect(tsconfig.compilerOptions.lib).toContain('dom');
      expect(tsconfig.compilerOptions.allowJs).toBe(true);
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
      expect(tsconfig.compilerOptions.strict).toBe(false);
      expect(tsconfig.compilerOptions.noEmit).toBe(true);
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
      expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
      expect(tsconfig.compilerOptions.isolatedModules).toBe(true);
      expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
      expect(tsconfig.compilerOptions.incremental).toBe(true);
      expect(tsconfig.compilerOptions.plugins).toBeDefined();
      expect(tsconfig.compilerOptions.paths).toBeDefined();
      expect(tsconfig.compilerOptions.paths['@/gasket']).toEqual(['./dist/gasket.js']);
    });

    it('should have valid tsconfig.server.json', () => {
      const tsconfigServerPath = join(templateDir, 'tsconfig.server.json');
      const tsconfigServer = JSON.parse(readFileSync(tsconfigServerPath, 'utf8'));

      expect(tsconfigServer.compilerOptions).toBeDefined();
      expect(tsconfigServer.compilerOptions.module).toBe('NodeNext');
      expect(tsconfigServer.compilerOptions.moduleResolution).toBe('NodeNext');
      expect(tsconfigServer.compilerOptions.outDir).toBe('dist');
      expect(tsconfigServer.include).toContain('./plugins');
      expect(tsconfigServer.include).toContain('server.ts');
      expect(tsconfigServer.include).toContain('gasket.ts');
      expect(tsconfigServer.include).toContain('gasket-data.ts');
    });
  });

  describe('gasket configuration', () => {
    it('should have valid gasket.ts', () => {
      const gasketPath = join(templateDir, 'gasket.ts');
      const gasketConfig = readFileSync(gasketPath, 'utf8');

      // Check imports
      expect(gasketConfig).toContain("import { makeGasket } from '@gasket/core'");
      expect(gasketConfig).toContain("import pluginCommand from '@gasket/plugin-command'");
      expect(gasketConfig).toContain("import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins'");
      expect(gasketConfig).toContain("import pluginLogger from '@gasket/plugin-logger'");
      expect(gasketConfig).toContain("import pluginWebpack from '@gasket/plugin-webpack'");
      expect(gasketConfig).toContain("import pluginWinston from '@gasket/plugin-winston'");
      expect(gasketConfig).toContain("import pluginHttpsProxy from '@gasket/plugin-https-proxy'");
      expect(gasketConfig).toContain("import pluginNextjs from '@gasket/plugin-nextjs'");
      expect(gasketConfig).toContain("import pluginIntl from '@gasket/plugin-intl'");

      // Check plugin configuration
      expect(gasketConfig).toContain('pluginCommand,');
      expect(gasketConfig).toContain('pluginDynamicPlugins,');
      expect(gasketConfig).toContain('pluginLogger,');
      expect(gasketConfig).toContain('pluginWebpack,');
      expect(gasketConfig).toContain('pluginWinston,');
      expect(gasketConfig).toContain('pluginHttpsProxy,');
      expect(gasketConfig).toContain('pluginNextjs,');
      expect(gasketConfig).toContain('pluginIntl');

      // Check dynamic plugins configuration
      expect(gasketConfig).toContain('dynamicPlugins: [');
      expect(gasketConfig).toContain('@gasket/plugin-docs');
      expect(gasketConfig).toContain('@gasket/plugin-metadata');
      expect(gasketConfig).toContain('@gasket/plugin-docusaurus');

      // Check httpsProxy configuration
      expect(gasketConfig).toContain('httpsProxy: {');
      expect(gasketConfig).toContain("protocol: 'http'");
      expect(gasketConfig).toContain("hostname: 'localhost'");
      expect(gasketConfig).toContain('port: 80');

      // Check intl configuration
      expect(gasketConfig).toContain('intl: {');
      expect(gasketConfig).toContain('locales: [');
      expect(gasketConfig).toContain("'en-US',");
      expect(gasketConfig).toContain("'fr-FR'");
      expect(gasketConfig).toContain("defaultLocale: 'en-US'");
      expect(gasketConfig).toContain("managerFilename: 'intl.ts'");
    });

    it('should have valid server.ts', () => {
      const serverPath = join(templateDir, 'server.ts');
      const serverContent = readFileSync(serverPath, 'utf8');

      expect(serverContent).toContain("import gasket from './gasket.js'");
      expect(serverContent).toContain('gasket.actions.startProxyServer()');
    });

    it('should have valid intl.ts', () => {
      const intlPath = join(templateDir, 'intl.ts');
      const intlContent = readFileSync(intlPath, 'utf8');

      expect(intlContent).toContain("import { makeIntlManager } from '@gasket/intl'");
      expect(intlContent).toContain('export default makeIntlManager(manifest)');
    });

    it('should have valid next.config.js', () => {
      const nextConfigPath = join(templateDir, 'next.config.js');
      const nextConfigContent = readFileSync(nextConfigPath, 'utf8');

      expect(nextConfigContent).toContain("import 'tsx'");
      expect(nextConfigContent).toContain("const gasket = (await import('./gasket.ts')).default");
      expect(nextConfigContent).toContain('export default gasket.actions.getNextConfig()');
    });
  });

  describe('pages router structure', () => {
    it('should have valid index.tsx page', () => {
      const indexPagePath = join(templateDir, 'pages/index.tsx');
      const indexPageContent = readFileSync(indexPagePath, 'utf8');

      expect(indexPageContent).toContain("import React, { CSSProperties } from 'react'");
      expect(indexPageContent).toContain("import { FormattedMessage } from 'react-intl'");
      expect(indexPageContent).toContain("import Head from '../components/head.tsx'");
      expect(indexPageContent).toContain("import GasketEmblem from '@gasket/assets/react/gasket-emblem.js'");
      expect(indexPageContent).toContain('function IndexPage()');
      expect(indexPageContent).toContain("<FormattedMessage id='gasket_welcome' />");
    });

    it('should have valid _app.tsx', () => {
      const appPagePath = join(templateDir, 'pages/_app.tsx');
      const appPageContent = readFileSync(appPagePath, 'utf8');

      expect(appPageContent).toContain("import React from 'react'");
      expect(appPageContent).toContain("import { useRouter } from 'next/router'");
      expect(appPageContent).toContain("import { IntlProvider } from 'react-intl'");
      expect(appPageContent).toContain("import { withMessagesProvider } from '@gasket/react-intl'");
      expect(appPageContent).toContain("import intlManager from '../intl'");
      expect(appPageContent).toContain('withMessagesProvider(intlManager)(IntlProvider)');
      expect(appPageContent).toContain('function App({ Component, pageProps }:');
    });

    it('should have valid _document.ts', () => {
      const documentPagePath = join(templateDir, 'pages/_document.ts');
      const documentPageContent = readFileSync(documentPagePath, 'utf8');

      expect(documentPageContent).toContain("import Document from 'next/document'");
      expect(documentPageContent).toContain("import { withGasketData } from '@gasket/nextjs/document'");
      expect(documentPageContent).toContain("import gasket from '@/gasket'");
      expect(documentPageContent).toContain('export default withGasketData(gasket)(Document)');
    });

    it('should have valid head component', () => {
      const headComponentPath = join(templateDir, 'components/head.tsx');
      const headComponentContent = readFileSync(headComponentPath, 'utf8');

      expect(headComponentContent).toContain("import React from 'react'");
      expect(headComponentContent).toContain("import NextHead from 'next/head.js'");
      expect(headComponentContent).toContain('const Head = ({ title, description }) =>');
    });
  });

  describe('localization', () => {
    it('should have locale files', () => {
      const enLocaleFile = join(templateDir, 'locales/en-US.json');
      const frLocaleFile = join(templateDir, 'locales/fr-FR.json');

      expect(existsSync(enLocaleFile)).toBe(true);
      expect(existsSync(frLocaleFile)).toBe(true);

      const enLocale = JSON.parse(readFileSync(enLocaleFile, 'utf8'));
      const frLocale = JSON.parse(readFileSync(frLocaleFile, 'utf8'));

      expect(enLocale.gasket_welcome).toBeDefined();
      expect(frLocale.gasket_welcome).toBeDefined();
    });
  });

  describe('test configuration', () => {
    it('should have valid vitest.config.js', () => {
      const vitestConfigPath = join(templateDir, 'vitest.config.js');
      const vitestConfig = readFileSync(vitestConfigPath, 'utf8');

      expect(vitestConfig).toContain("import { defineConfig } from 'vitest/config'");
      expect(vitestConfig).toContain("import react from '@vitejs/plugin-react'");
      expect(vitestConfig).toContain('react()');
      expect(vitestConfig).toContain("environment: 'jsdom'");
      expect(vitestConfig).toContain('globals: true');
    });

    it('should have valid test file', () => {
      const testPath = join(templateDir, 'test/index.test.tsx');
      const testContent = readFileSync(testPath, 'utf8');

      expect(testContent).toContain("import React from 'react'");
      expect(testContent).toContain("import { render, screen } from '@testing-library/react'");
      expect(testContent).toContain("import IndexPage from '../pages/index.tsx'");
      expect(testContent).toContain("import { expect, describe, it } from 'vitest'");
      expect(testContent).toContain("import { IntlProvider } from 'react-intl'");
      expect(testContent).toContain("const messages = createRequire(import.meta.url)('../locales/en-US.json')");
      expect(testContent).toContain("describe('IndexPage'");
      expect(testContent).toContain("it('renders page'");
      expect(testContent).toContain("expect(screen.getByRole('heading').textContent).toBe('Welcome to Gasket!')");
    });
  });

  describe('documentation', () => {
    it('should have README.md', () => {
      const readmePath = join(templateDir, 'README.md');
      const readmeContent = readFileSync(readmePath, 'utf8');

      expect(readmeContent).toContain('# {{{appName}}}');
      expect(readmeContent).toContain('### Development Proxy');
      expect(readmeContent).toContain('npm install');
      expect(readmeContent).toContain('npm run local');
      expect(readmeContent).toContain('npm run docs');
    });
  });
});
