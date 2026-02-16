import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import create from '../lib/create.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const { name, version, devDependencies } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

describe('create hook', () => {
  let mockContext;
  const root = path.join(dirName, '..', 'lib');

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn(),
        has: vi.fn()
      },
      readme: {
        markdownFile: vi.fn(),
        link: vi.fn()
      },
      files: {
        add: vi.fn()
      },
      gasketConfig: {
        add: vi.fn(),
        addPlugin: vi.fn()
      },
      packageManager: 'npm'
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('has expected timings', async function () {
    expect(create.timing.before).toEqual([
      '@gasket/plugin-intl',
      '@gasket/plugin-docusaurus'
    ]);
  });

  it('has handler function', async function () {
    expect(create.handler).toBeInstanceOf(Function);
  });

  describe('createAppFiles', () => {

    it('adds pages router files', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/page-router/**/!(*.ts|*.tsx)`
      );
    });

    it('adds app router files', async function () {
      mockContext.nextServerType = 'appRouter';
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/app-router/**/!(*.ts|*.tsx)`
      );
    });

    it('handles TypeScript', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/page-router/**/!(*.js|*.jsx)`
      );
    });

    it('adds partial markdown file for app-router', async function () {
      mockContext.nextServerType = 'appRouter';
      await create.handler({}, mockContext);
      expect(mockContext.readme.markdownFile).toHaveBeenCalledWith(
        `${root}/../generator/markdown/app-router.md`
      );
      expect(mockContext.readme.link).toHaveBeenCalledWith('App Router', expect.any(String));
    });

    it('adds partial markdown file for page-router', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.readme.markdownFile).toHaveBeenCalledWith(
        `${root}/../generator/markdown/page-router.md`
      );
      expect(mockContext.readme.link).toHaveBeenCalledWith('Page Router', expect.any(String));
    });

    it('adds partial markdown file for custom server', async function () {
      mockContext.nextServerType = 'customServer';
      await create.handler({}, mockContext);
      expect(mockContext.readme.markdownFile).toHaveBeenCalledWith(
        `${root}/../generator/markdown/custom-server.md`
      );

      expect(mockContext.readme.link).toHaveBeenCalledWith('Custom Server', expect.any(String));
      expect(mockContext.readme.link).toHaveBeenCalledWith('Page Router', expect.any(String));
    });
  });

  describe('createTestFiles', () => {

    it('adds mocha files', async function () {
      mockContext.testPlugins = ['@gasket/mocha'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/mocha/page-router/*`,
        `${root}/../generator/mocha/page-router/**/!(*.ts|*.tsx)`
      );
    });

    it('adds jest files', async function () {
      mockContext.testPlugins = ['@gasket/jest'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/jest/page-router/*`,
        `${root}/../generator/jest/page-router/**/!(*.ts|*.tsx)`
      );
    });

    it('adds cypress files', async function () {
      mockContext.testPlugins = ['@gasket/cypress'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/cypress/*`,
        `${root}/../generator/cypress/**/*`
      );
    });

    it('adds ts extension files', async function () {
      mockContext.typescript = true;
      mockContext.testPlugins = ['@gasket/jest'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/jest/page-router/*`,
        `${root}/../generator/jest/page-router/**/!(*.js|*.jsx)`
      );
    });

    it('adds no files for no test plugins', async function () {
      mockContext.testPlugins = [];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).not.toHaveBeenCalledWith(
        `${root}/../generator/jest/page-router/*`,
        `${root}/../generator/jest/page-router/**/!(*.js|*.jsx)`
      );
    });

    it('adds files for app-router', async function () {
      mockContext.nextServerType = 'appRouter';
      mockContext.testPlugins = ['@gasket/jest'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/jest/app-router/*`,
        `${root}/../generator/jest/app-router/**/!(*.ts|*.tsx)`
      );
    });
  });

  describe('createNextFiles', () => {

    it('adds next.config.js', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/next/*(next.config).js`
      );
    });

    it('adds server.js', async function () {
      mockContext.nextDevProxy = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/next/*.js`
      );
    });

    it('adds specific files for TypeScript', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/next/typescript/*`
      );
    });
  });

  describe('configureSitemap', () => {

    it('adds sitemap files', async function () {
      mockContext.addSitemap = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/sitemap/*`
      );
    });

    it('adds sitemap dependencies', async function () {
      mockContext.addSitemap = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
        'next-sitemap': '^3.1.29'
      });
    });

    it('adds sitemap script', async function () {
      mockContext.addSitemap = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        sitemap: 'next-sitemap'
      });
    });
  });

  describe('addDependencies', () => {

    it('adds itself to the dependencies', async function () {
      await create.handler({}, mockContext);

      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
        expect.objectContaining({ [name]: `^${version}` })
      );
    });

    it('adds dependencies', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
        '@gasket/assets': devDependencies['@gasket/assets'],
        '@gasket/nextjs': devDependencies['@gasket/nextjs'],
        [name]: `^${version}`,
        'next': devDependencies.next,
        'react': devDependencies.react,
        'react-dom': devDependencies['react-dom']
      });
    });

    it('adds TypeScript-related packages', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
        '@types/react': devDependencies['@types/react']
      });
    });

    it('adds nodemon for dev', async function () {
      mockContext.typescript = false;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
        nodemon: devDependencies.nodemon
      });
    });
  });

  describe('addNpmScripts', () => {

    it('adds default scripts', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'next start',
        local: 'next dev --webpack',
        preview: 'npm run build && npm run start'
      });
    });

    it('uses yarn commands when packageManager is yarn', async function () {
      mockContext.packageManager = 'yarn';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'next start',
        local: 'next dev --webpack',
        preview: 'yarn build && yarn start'
      });
    });

    it('uses pnpm commands when packageManager is pnpm', async function () {
      mockContext.packageManager = 'pnpm';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'next start',
        local: 'next dev --webpack',
        preview: 'pnpm build && pnpm start'
      });
    });

    it('adds prebuild script for gasket-intl', async function () {
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'next start',
        local: 'next dev --webpack',
        preview: 'npm run build && npm run start',
        prebuild: 'node gasket.js build'
      });
    });

    it('adjust scripts for custom server', async function () {
      mockContext.nextServerType = 'customServer';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'node server.js',
        preview: 'npm run build && npm run start',
        local: 'GASKET_DEV=1 nodemon server.js'
      });
    });

    it('adjusts scripts for devProxy', async function () {
      mockContext.nextServerType = 'appRouter';
      mockContext.nextDevProxy = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'build': 'next build --webpack',
        'start': 'npm run start:https & next start',
        'local': 'npm run local:https & next dev --webpack',
        'preview': 'npm run build && npm run start',
        'start:https': 'node server.js',
        'local:https': 'nodemon server.js'
      });
    });

    it('adjusts scripts for typescript', async function () {
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build --webpack',
        start: 'next start',
        local: 'next dev --webpack',
        preview: 'npm run build && npm run start',
        prebuild: 'tsx gasket.ts build'
      });
    });

    it('adjusts scripts for custom server & typescript', async function () {
      mockContext.nextServerType = 'customServer';
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'build:tsc': 'tsc -p ./tsconfig.server.json',
        'build:tsc:watch': 'tsc -p ./tsconfig.server.json --watch',
        'build': 'npm run build:tsc && next build --webpack',
        'start': 'node dist/server.js',
        'preview': 'npm run build && npm run start',
        'local': 'concurrently "npm run build:tsc:watch" "GASKET_DEV=1 tsx watch server.ts"',
        'prebuild': 'tsx gasket.ts build'
      });
    });

    it('adjusts scripts for custom server & typescript with yarn', async function () {
      mockContext.nextServerType = 'customServer';
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      mockContext.packageManager = 'yarn';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'build:tsc': 'tsc -p ./tsconfig.server.json',
        'build:tsc:watch': 'tsc -p ./tsconfig.server.json --watch',
        'build': 'yarn build:tsc && next build --webpack',
        'start': 'node dist/server.js',
        'preview': 'yarn build && yarn start',
        'local': 'concurrently "yarn build:tsc:watch" "GASKET_DEV=1 tsx watch server.ts"',
        'prebuild': 'tsx gasket.ts build'
      });
    });

    it('adjusts scripts for nextDevProxy & typescript', async function () {
      mockContext.nextServerType = 'appRouter';
      mockContext.nextDevProxy = true;
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'start:https': 'node dist/server.js',
        'local:https': 'tsx watch server.ts',
        'start': 'npm run start:https & next start',
        'local': 'concurrently "npm run build:tsc:watch" "npm run local:https" "next dev --webpack"',
        'build:tsc': 'tsc -p ./tsconfig.server.json',
        'build:tsc:watch': 'tsc -p ./tsconfig.server.json --watch',
        'build': 'npm run build:tsc && next build --webpack',
        'preview': 'npm run build && npm run start',
        'prebuild': 'tsx gasket.ts build'
      });
    });

    it('adjusts scripts for nextDevProxy & typescript with pnpm', async function () {
      mockContext.nextServerType = 'appRouter';
      mockContext.nextDevProxy = true;
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      mockContext.packageManager = 'pnpm';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'start:https': 'node dist/server.js',
        'local:https': 'tsx watch server.ts',
        'start': 'pnpm start:https & next start',
        'local': 'concurrently "pnpm build:tsc:watch" "pnpm local:https" "next dev --webpack"',
        'build:tsc': 'tsc -p ./tsconfig.server.json',
        'build:tsc:watch': 'tsc -p ./tsconfig.server.json --watch',
        'build': 'pnpm build:tsc && next build --webpack',
        'preview': 'pnpm build && pnpm start',
        'prebuild': 'tsx gasket.ts build'
      });
    });
  });

  describe('addConfig', () => {

    it('adds plugin import', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginNextjs', name);
    });

    it('adds httpsProxy config', async function () {
      mockContext.nextDevProxy = true;
      await create.handler({}, mockContext);
      expect(mockContext.gasketConfig.add).toHaveBeenCalledWith('httpsProxy', {
        protocol: 'http',
        hostname: 'localhost',
        port: 80,
        xfwd: true,
        ws: true,
        target: {
          host: 'localhost',
          port: 3000
        }
      });
    });
  });

  it('sets reactIntlPkg to react-intl if hasGasketIntl is true', async function () {
    mockContext.hasGasketIntl = true;
    await create.handler({}, mockContext);
    expect(mockContext.reactIntlPkg).toBe('react-intl');
  });

  it('does not set reactIntlPkg if hasGasketIntl is false', async function () {
    mockContext.hasGasketIntl = false;
    await create.handler({}, mockContext);
    expect(mockContext.reactIntlPkg).toBeUndefined();
  });
});
