import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const templateDir = join(dirName, '..', 'template');

describe('@gasket/template-api-express', () => {
  describe('template structure', () => {
    it('should have all required files', () => {
      const requiredFiles = [
        'package.json',
        'gasket.ts',
        'server.ts',
        'tsconfig.json',
        'vitest.config.js',
        '.gitignore',
        'README.md',
        'swagger.json',
        'plugins/routes-plugin.ts',
        'plugins/README.md',
        'test/index.test.ts'
      ];

      requiredFiles.forEach(file => {
        const filePath = join(templateDir, file);
        expect(existsSync(filePath), `${file} should exist`).toBe(true);
      });
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
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-express');
      expect(packageJson.dependencies).toHaveProperty('@gasket/plugin-https');
      expect(packageJson.dependencies).toHaveProperty('express');
    });

    it('should have valid TypeScript configuration', () => {
      const tsconfigPath = join(templateDir, 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));

      expect(tsconfig.compilerOptions).toHaveProperty('module', 'NodeNext');
      expect(tsconfig.compilerOptions).toHaveProperty('moduleResolution', 'NodeNext');
      expect(tsconfig.compilerOptions).toHaveProperty('target', 'ESNext');
      expect(tsconfig.compilerOptions).toHaveProperty('outDir', 'dist');
      expect(tsconfig.include).toContain('./plugins');
      expect(tsconfig.include).toContain('gasket.ts');
      expect(tsconfig.include).toContain('server.ts');
    });

    it('should have valid ESLint configuration', () => {
      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.eslintConfig).toHaveProperty('extends');
      expect(packageJson.eslintConfig.extends).toContain('godaddy');
      expect(packageJson.eslintConfig).toHaveProperty('parser', '@typescript-eslint/parser');
      expect(packageJson.eslintIgnore).toContain('dist');
    });

    it('should have valid vitest.config.js file', () => {
      const vitestConfigPath = join(templateDir, 'vitest.config.js');
      const vitestConfig = readFileSync(vitestConfigPath, 'utf8');

      expect(vitestConfig).toMatch(/test/);
      expect(vitestConfig).toMatch(/globals: true/);
    });

    it('should have correct dependencies', () => {
      const requiredDependencies = [
        '@gasket/core',
        '@gasket/plugin-command',
        '@gasket/plugin-dynamic-plugins',
        '@gasket/plugin-express',
        '@gasket/plugin-https',
        '@gasket/plugin-logger',
        '@gasket/plugin-swagger',
        '@gasket/plugin-winston',
        '@gasket/request',
        '@gasket/utils',
        'express',
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
        '@docusaurus/core',
        '@docusaurus/preset-classic',
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        '@gasket/plugin-metadata',
        '@typescript-eslint/parser',
        '@vitest/coverage-v8',
        'ajv',
        'eslint',
        'eslint-config-godaddy',
        'eslint-plugin-react-hooks',
        'react',
        'react-dom',
        'search-insights',
        'tsx',
        'typescript',
        'vitest'
      ];

      const packageJsonPath = join(templateDir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      requiredDevDependencies.forEach(dependency => {
        expect(packageJson.devDependencies).toHaveProperty(dependency);
      });
    });
  });

  describe('gasket configuration', () => {
    it('should have valid gasket.ts file', () => {
      const gasketPath = join(templateDir, 'gasket.ts');
      const gasketContent = readFileSync(gasketPath, 'utf8');

      // Check for required imports
      expect(gasketContent).toContain("import { makeGasket } from '@gasket/core'");
      expect(gasketContent).toContain("import pluginExpress from '@gasket/plugin-express'");
      expect(gasketContent).toContain("import pluginHttps from '@gasket/plugin-https'");
      expect(gasketContent).toContain("import pluginSwagger from '@gasket/plugin-swagger'");

      // Check for plugin configuration
      expect(gasketContent).toContain('pluginExpress');
      expect(gasketContent).toContain('pluginHttps');
      expect(gasketContent).toContain('pluginSwagger');

      // Check for docs command configuration
      expect(gasketContent).toContain('commands:');
      expect(gasketContent).toContain('docs:');
      expect(gasketContent).toContain('dynamicPlugins:');
    });

    it('should have valid server.ts file', () => {
      const serverPath = join(templateDir, 'server.ts');
      const serverContent = readFileSync(serverPath, 'utf8');

      expect(serverContent).toContain("import gasket from './gasket.js'");
      expect(serverContent).toContain('gasket.actions.startServer()');
    });
  });

  describe('plugins', () => {
    it('should have valid routes plugin', () => {
      const routesPluginPath = join(templateDir, 'plugins', 'routes-plugin.ts');
      const routesContent = readFileSync(routesPluginPath, 'utf8');

      expect(routesContent).toContain('export const defaultHandler');
      expect(routesContent).toContain('export default');
      expect(routesContent).toContain("name: 'routes-plugin'");
      expect(routesContent).toContain('hooks:');
      expect(routesContent).toContain('express(gasket, app)');
      expect(routesContent).toContain("app.get('/default', defaultHandler)");

      // Check for Swagger documentation
      expect(routesContent).toContain('@swagger');
      expect(routesContent).toContain('/default:');
    });
  });

  describe('swagger configuration', () => {
    it('should have valid swagger.json', () => {
      const swaggerPath = join(templateDir, 'swagger.json');
      const swagger = JSON.parse(readFileSync(swaggerPath, 'utf8'));

      expect(swagger).toHaveProperty('info');
      expect(swagger.info).toHaveProperty('title', 'express-ts');
      expect(swagger.info).toHaveProperty('version', '0.0.0');
      expect(swagger).toHaveProperty('paths');
      expect(swagger.paths).toHaveProperty('/default');
      expect(swagger.paths['/default']).toHaveProperty('get');
    });
  });

  describe('test setup', () => {
    it('should have valid test configuration', () => {
      const vitestConfigPath = join(templateDir, 'vitest.config.js');
      const vitestContent = readFileSync(vitestConfigPath, 'utf8');

      expect(vitestContent).toContain("import { defineConfig } from 'vitest/config'");
      expect(vitestContent).toContain('test:');
      expect(vitestContent).toContain('globals: true');
    });

    it('should have example test file', () => {
      const testPath = join(templateDir, 'test', 'index.test.ts');
      const testContent = readFileSync(testPath, 'utf8');

      expect(testContent).toContain("import { defaultHandler } from '../plugins/routes-plugin.ts'");
      expect(testContent).toContain("import { vi, describe, expect, beforeEach, it } from 'vitest'");
      expect(testContent).toContain("describe('Routes'");
      expect(testContent).toContain('defaultHandler should use expected message');
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
      expect(readmeContent).toContain('### TypeScript');
      expect(readmeContent).toContain('npm run build');
      expect(readmeContent).toContain('ESM & TypeScript');
    });

    it('should have plugins README', () => {
      const pluginsReadmePath = join(templateDir, 'plugins', 'README.md');
      const pluginsContent = readFileSync(pluginsReadmePath, 'utf8');

      expect(pluginsContent).toContain('# Local Plugins');
      expect(pluginsContent).toContain('Routes plugin');
      expect(pluginsContent).toContain('GET /default');
    });
  });

  describe('gitignore', () => {
    it('should have proper .gitignore', () => {
      const gitignorePath = join(templateDir, '.gitignore');
      const gitignoreContent = readFileSync(gitignorePath, 'utf8');

      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });
  });
});
