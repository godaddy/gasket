import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const templateDir = join(dirName, '..', 'template');

describe('@gasket/template-nextjs-app', () => {
  describe('template structure', () => {
    it('should have all required files', () => {
      const requiredFiles = [
        'package.json',
        'gasket.ts',
        'server.ts',
        'intl.ts',
        'next.config.js',
        'tsconfig.json',
        'tsconfig.server.json',
        'vitest.config.js',
        'README.md',
        'app/layout.tsx',
        'app/page.tsx',
        'locales/en-US.json',
        'locales/fr-FR.json',
        'test/index.test.tsx'
      ];

      const checkFileExists = (file) => {
        const filePath = join(templateDir, file);
        expect(existsSync(filePath), `${file} should exist`).toBe(true);
      };

      requiredFiles.forEach(checkFileExists);
    });

    it('should have proper package.json structure', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.name).toBe('{{{appName}}}');
      expect(packageJson.type).toBe('module');
      expect(packageJson.scripts).toHaveProperty('local');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('preview');
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('docs');
      expect(packageJson.scripts).toHaveProperty('lint');

      // Check required dependencies
      expect(packageJson.dependencies).toHaveProperty('@gasket/core');
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-nextjs');
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-intl');
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
    });

    it('should have valid TypeScript configuration', () => {
      const tsconfigPath = join(templateDir, 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

      expect(tsconfig.compilerOptions).toHaveProperty('module', 'ESNext');
      expect(tsconfig.compilerOptions).toHaveProperty('moduleResolution', 'bundler');
      expect(tsconfig.compilerOptions).toHaveProperty('target', 'ESNext');
      expect(tsconfig.compilerOptions).toHaveProperty('jsx', 'react-jsx');
      expect(tsconfig.compilerOptions.lib).toContain('dom');
      expect(tsconfig.include).toContain('**/*.tsx');
    });

    it('should have valid server TypeScript configuration', () => {
      const tsconfigServerPath = join(templateDir, 'tsconfig.server.json');
      const tsconfigServer = JSON.parse(readFileSync(tsconfigServerPath, 'utf8'));

      expect(tsconfigServer.compilerOptions).toHaveProperty('module', 'NodeNext');
      expect(tsconfigServer.compilerOptions).toHaveProperty('moduleResolution', 'NodeNext');
      expect(tsconfigServer.compilerOptions).toHaveProperty('target', 'ESNext');
      expect(tsconfigServer.compilerOptions).toHaveProperty('outDir', 'dist');
    });

    it('should have valid ESLint configuration', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.eslintConfig).toHaveProperty('extends');
      expect(packageJson.eslintConfig.extends).toContain('godaddy-react');
      expect(packageJson.eslintConfig.extends).toContain('next');
      expect(packageJson.eslintConfig.extends).toContain('plugin:@godaddy/react-intl/recommended');
      expect(packageJson.eslintConfig).toHaveProperty('parser', '@typescript-eslint/parser');
      expect(packageJson.eslintConfig.settings).toHaveProperty('localeFiles');
      expect(packageJson.eslintIgnore).toContain('dist');
    });

    it('should have valid vitest.config.js file', () => {
      const vitestConfigPath = join(templateDir, 'vitest.config.js');
      const vitestConfig = readFileSync(vitestConfigPath, 'utf8');

      expect(vitestConfig).toMatch(/test/);
      expect(vitestConfig).toMatch(/globals: true/);
      expect(vitestConfig).toMatch(/environment: 'jsdom'/);
      expect(vitestConfig).toMatch(/react\(\)/);
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

      const checkDependency = (dependency) => {
        expect(packageJson.dependencies).toHaveProperty(dependency);
      };

      requiredDependencies.forEach(checkDependency);
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
  });

  describe('gasket configuration', () => {
    it('should have valid gasket.ts file', () => {
      const gasketPath = join(templateDir, 'gasket.ts');
      const gasketContent = readFileSync(gasketPath, 'utf8');

      // Check for required imports
      expect(gasketContent).toContain("import { makeGasket } from '@gasket/core'");
      expect(gasketContent).toContain("import pluginNextjs from '@gasket/plugin-nextjs'");
      expect(gasketContent).toContain("import pluginIntl from '@gasket/plugin-intl'");
      expect(gasketContent).toContain("import pluginHttpsProxy from '@gasket/plugin-https-proxy'");

      // Check for plugin configuration
      expect(gasketContent).toContain('pluginNextjs');
      expect(gasketContent).toContain('pluginIntl');
      expect(gasketContent).toContain('pluginHttpsProxy');

      // Check for docs command configuration
      expect(gasketContent).toContain('commands:');
      expect(gasketContent).toContain('docs:');
      expect(gasketContent).toContain('dynamicPlugins:');

      // Check for intl configuration
      expect(gasketContent).toContain('intl:');
      expect(gasketContent).toContain('locales:');
      expect(gasketContent).toContain('defaultLocale:');

      // Check for httpsProxy configuration
      expect(gasketContent).toContain('httpsProxy:');
    });

    it('should have valid server.ts file', () => {
      const serverPath = join(templateDir, 'server.ts');
      const serverContent = readFileSync(serverPath, 'utf8');

      expect(serverContent).toContain("import gasket from './gasket.js'");
      expect(serverContent).toContain('gasket.actions.startProxyServer()');
    });

    it('should have valid next.config.js file', () => {
      const nextConfigPath = join(templateDir, 'next.config.js');
      const nextConfigContent = readFileSync(nextConfigPath, 'utf8');

      expect(nextConfigContent).toContain("const gasket = (await import('./gasket.ts')).default");
      expect(nextConfigContent).toContain('gasket.actions.getNextConfig()');
    });
  });

  describe('app router structure', () => {
    it('should have valid layout.tsx', () => {
      const layoutPath = join(templateDir, 'app', 'layout.tsx');
      const layoutContent = readFileSync(layoutPath, 'utf8');

      expect(layoutContent).toContain('import React from \'react\'');
      expect(layoutContent).toContain("import gasket from '@/gasket'");
      expect(layoutContent).toContain("import { withGasketData } from '@gasket/nextjs/layout'");
      expect(layoutContent).toContain('function RootLayout');
      expect(layoutContent).toContain('withGasketData(gasket)(RootLayout)');
    });

    it('should have valid page.tsx', () => {
      const pagePath = join(templateDir, 'app', 'page.tsx');
      const pageContent = readFileSync(pagePath, 'utf8');

      expect(pageContent).toContain('import React');
      expect(pageContent).toContain("import GasketEmblem from '@gasket/assets/react/gasket-emblem.js'");
      expect(pageContent).toContain('function IndexPage');
      expect(pageContent).toContain('Welcome to Gasket!');
      expect(pageContent).toContain('export const metadata');
    });
  });

  describe('internationalization', () => {
    it('should have valid intl.ts file', () => {
      const intlPath = join(templateDir, 'intl.ts');
      const intlContent = readFileSync(intlPath, 'utf8');

      expect(intlContent).toContain("import { makeIntlManager } from '@gasket/intl'");
      expect(intlContent).toContain('defaultLocale: \'en-US\'');
      expect(intlContent).toContain('locales: [');
      expect(intlContent).toContain('\'en-US\'');
      expect(intlContent).toContain('\'fr-FR\'');
      expect(intlContent).toContain('imports: {');
    });

    it('should have locale files', () => {
      const enLocalePath = join(templateDir, 'locales', 'en-US.json');
      const frLocalePath = join(templateDir, 'locales', 'fr-FR.json');

      expect(existsSync(enLocalePath)).toBe(true);
      expect(existsSync(frLocalePath)).toBe(true);

      const enLocale = JSON.parse(readFileSync(enLocalePath, 'utf8'));
      expect(enLocale).toHaveProperty('gasket_welcome');
      expect(enLocale).toHaveProperty('gasket_learn');
    });
  });

  describe('test setup', () => {
    it('should have valid test configuration', () => {
      const vitestConfigPath = join(templateDir, 'vitest.config.js');
      const vitestContent = readFileSync(vitestConfigPath, 'utf8');

      expect(vitestContent).toContain("import { defineConfig } from 'vitest/config'");
      expect(vitestContent).toContain("import react from '@vitejs/plugin-react'");
      expect(vitestContent).toContain('test:');
      expect(vitestContent).toContain('environment: \'jsdom\'');
      expect(vitestContent).toContain('globals: true');
    });

    it('should have example test file', () => {
      const testPath = join(templateDir, 'test', 'index.test.tsx');
      const testContent = readFileSync(testPath, 'utf8');

      expect(testContent).toContain("import React from 'react'");
      expect(testContent).toContain("import { render, screen } from '@testing-library/react'");
      expect(testContent).toContain("import IndexPage from '../app/page.tsx'");
      expect(testContent).toContain("import { expect, describe, it } from 'vitest'");
      expect(testContent).toContain("describe('IndexPage'");
      expect(testContent).toContain('renders page');
      expect(testContent).toContain('Welcome to Gasket!');
    });
  });

  describe('documentation', () => {
    it('should have comprehensive README', () => {
      const readmePath = join(templateDir, 'README.md');
      const readmeContent = readFileSync(readmePath, 'utf8');

      expect(readmeContent).toContain('# {{{appName}}}');
      expect(readmeContent).toContain('## Getting Started');
      expect(readmeContent).toContain('### Development');
      expect(readmeContent).toContain('npm run local');
      expect(readmeContent).toContain('### TypeScript & App Router');
      expect(readmeContent).toContain('ESM & TypeScript');
    });
  });
});
