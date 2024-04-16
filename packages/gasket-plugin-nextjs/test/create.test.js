const path = require('path');
const { devDependencies } = require('../package');

describe('create hook', () => {
  let mockContext;
  const plugin = require('../lib/');
  const root = path.join(__dirname, '..', 'lib');

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn(),
        has: jest.fn()
      },
      files: { add: jest.fn() },
      gasketConfig: {
        add: jest.fn()
      }
    };
  });

  it('has expected timings', async function () {
    expect(plugin.hooks.create.timing.before).toEqual(['@gasket/plugin-intl']);
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-redux']);
  });

  it('adds the appropriate globs', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/app/.*`,
      `${root}/../generator/app/*`,
      `${root}/../generator/app/**/*`
    );
  });

  it('adds the appropriate globs for mocha', async function () {
    mockContext.testPlugin = '@gasket/mocha';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/mocha/*`,
      `${root}/../generator/mocha/**/*`
    );
  });

  it('adds the appropriate globs for jest', async function () {
    mockContext.testPlugin = '@gasket/jest';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/jest/*`,
      `${root}/../generator/jest/**/*`
    );
  });

  it('adds appropriate dependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      '@gasket/assets': devDependencies['@gasket/assets'],
      '@gasket/nextjs': devDependencies['@gasket/nextjs'],
      'next': devDependencies.next,
      'prop-types': devDependencies['prop-types'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom']
    });
  });

  it('adds appropriate devDependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      nodemon: devDependencies.nodemon
    });
  });

  it('adds the appropriate globs for redux', async function () {
    mockContext.pkg.has = jest
      .fn()
      .mockImplementation(
        (o, f) => o === 'dependencies' && f === '@gasket/redux'
      );
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/redux/*`,
      `${root}/../generator/redux/**/*`
    );
  });

  it('adds appropriate dependencies for redux', async function () {
    mockContext.pkg.has = jest
      .fn()
      .mockImplementation(
        (o, f) => o === 'dependencies' && f === '@gasket/redux'
      );
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
    });
  });

  it('adds appropriate dependencies for sitemap', async function () {
    mockContext.addSitemap = true;
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/sitemap/*`
    );
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      'next-sitemap': '^3.1.29'
    });
    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      sitemap: 'next-sitemap'
    });
  });

  it('adds next config & server files', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/next/*`
    );
  });

  it('adds the appropriate npm scripts for next cli', async function () {
    mockContext.nextServerType = 'defaultServer';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      'build': 'next build',
      'start': 'next start',
      'start:local': 'next start & GASKET_ENV=local node server.js',
      'local': 'next dev & nodemon server.js'
    });
  });

  it('adds the appropriate npm scripts for next custom server', async function () {
    mockContext.nextServerType = 'customServer';
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      'build': 'next build',
      'start': 'next build && node server.js',
      'start:local': 'next build && GASKET_ENV=local node server.js',
      'local': 'GASKET_DEV=1 GASKET_ENV=local nodemon server.js'
    });
  });
});
