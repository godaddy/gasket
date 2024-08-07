const path = require('path');
const { name, version, devDependencies } = require('../package');
const create = require('../lib/create');

describe('create hook', () => {
  let mockContext;
  const root = path.join(__dirname, '..', 'lib');

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn(),
        has: jest.fn()
      },
      files: { add: jest.fn() },
      gasketConfig: {
        add: jest.fn(),
        addPlugin: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has expected timings', async function () {
    expect(create.timing.before).toEqual(['@gasket/plugin-intl']);
  });

  it('has handler function', async function () {
    expect(create.handler).toBeInstanceOf(Function);
  });

  describe('createAppFiles', () => {

    it('adds shared files', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/shared/**/*`
      );
    });

    it('adds pages router files', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/pages-router/**/!(*.ts|*.tsx)`
      );
    });

    it('adds app router files', async function () {
      mockContext.useAppRouter = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/app-router/**/!(*.ts|*.tsx)`
      );
    });

    it('handles TypeScript', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/app/pages-router/**/!(*.js|.jsx)`
      );
    });
  });

  describe('createTestFiles', () => {

    it('adds mocha files', async function () {
      mockContext.testPlugins = ['@gasket/mocha'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/mocha/*`,
        `${root}/../generator/mocha/**/*`
      );
    });

    it('adds jest files', async function () {
      mockContext.testPlugins = ['@gasket/jest'];
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/jest/*`,
        `${root}/../generator/jest/**/*`
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

    it('adds next.config.cjs for TypeScript', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        `${root}/../generator/next/*.cjs`
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

    it('adds babel-register for TypeScript', async function () {
      mockContext.typescript = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
        '@babel/register': devDependencies['@babel/register'],
        '@gasket/assets': devDependencies['@gasket/assets'],
        '@gasket/nextjs': devDependencies['@gasket/nextjs'],
        [name]: `^${version}`,
        'next': devDependencies.next,
        'react': devDependencies.react,
        'react-dom': devDependencies['react-dom']
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
        build: 'next build',
        start: 'next start',
        local: 'next dev',
        preview: 'npm run build && npm run start'
      });
    });

    it('adds prebuild script for gasket-intl', async function () {
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build',
        start: 'next start',
        local: 'next dev',
        preview: 'npm run build && npm run start',
        prebuild: 'node gasket.js build'
      });
    });

    it('adjust scripts for custom server', async function () {
      mockContext.nextServerType = 'customServer';
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build',
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
        'local': 'next dev & nodemon server.js',
        'start:local': 'next start & node server.js',
        'preview': 'npm run build && npm run start & node server.js',
        'build': 'next build',
        'start': 'next start'
      });
    });

    it('adjusts scripts for typescript', async function () {
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        build: 'next build',
        start: 'next start',
        local: 'next dev',
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
        build: 'tsc -p ./tsconfig.server.json && next build',
        start: 'node dist/server.js',
        preview: 'npm run build && npm run start',
        local: 'GASKET_DEV=1 tsx watch server.ts',
        prebuild: 'tsx gasket.ts build'
      });
    });

    it('adjusts scripts for devProxy & typescript', async function () {
      mockContext.nextServerType = 'appRouter';
      mockContext.nextDevProxy = true;
      mockContext.typescript = true;
      mockContext.hasGasketIntl = true;
      await create.handler({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        'local': 'next dev & tsx watch server.ts',
        'start:local': 'next start & tsx server.ts',
        'preview': 'npm run build && npm run start & tsx server.ts',
        'build': 'next build',
        'start': 'next start',
        'prebuild': 'tsx gasket.ts build'
      });
    });
  });

  describe('addConfig', () => {

    it('adds plugin import', async function () {
      await create.handler({}, mockContext);
      expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginNextjs', name);
    });

    it('adds devProxy config', async function () {
      mockContext.nextDevProxy = true;
      await create.handler({}, mockContext);
      expect(mockContext.gasketConfig.add).toHaveBeenCalledWith('devProxy', {
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
});
