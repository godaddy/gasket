const path = require('path');
const { name, version, devDependencies } = require('../package');

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
        add: jest.fn(),
        addPlugin: jest.fn()
      }
    };
  });

  it('has expected timings', async function () {
    expect(plugin.hooks.create.timing.before).toEqual(['@gasket/plugin-intl']);
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-redux']);
  });

  it('adds the appropriate globs for pages router', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    const first = mockContext.files.add.mock.calls[0];
    const second = mockContext.files.add.mock.calls[1];

    expect(first).toEqual([
      `${root}/../generator/app/common/.*`,
      `${root}/../generator/app/common/*`,
      `${root}/../generator/app/common/**/*`
    ]);
    expect(second).toEqual([
      `${root}/../generator/app/pages-router/.*`,
      `${root}/../generator/app/pages-router/*`,
      `${root}/../generator/app/pages-router/**/*`
    ]);
  });

  it('adds the appropriate globs for app router', async function () {
    mockContext.useAppRouter = true;
    await plugin.hooks.create.handler({}, mockContext);

    const first = mockContext.files.add.mock.calls[0];
    const second = mockContext.files.add.mock.calls[1];

    expect(first).toEqual([
      `${root}/../generator/app/common/.*`,
      `${root}/../generator/app/common/*`,
      `${root}/../generator/app/common/**/*`
    ]);
    expect(second).toEqual([
      `${root}/../generator/app/app-router/.*`,
      `${root}/../generator/app/app-router/*`,
      `${root}/../generator/app/app-router/**/*`
    ]);
  });

  it('adds the appropriate globs for mocha', async function () {
    mockContext.testPlugins = ['@gasket/mocha'];
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/mocha/*`,
      `${root}/../generator/mocha/**/*`
    );
  });

  it('adds the appropriate globs for jest', async function () {
    mockContext.testPlugins = ['@gasket/jest'];
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/jest/*`,
      `${root}/../generator/jest/**/*`
    );
  });

  it('adds itself to the dependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({ [name]: `^${version}` })
    );
  });

  it('adds appropriate dependencies', async function () {
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies',
      expect.objectContaining({
        '@gasket/assets': devDependencies['@gasket/assets'],
        '@gasket/nextjs': devDependencies['@gasket/nextjs'],
        'next': devDependencies.next,
        'prop-types': devDependencies['prop-types'],
        'react': devDependencies.react,
        'react-dom': devDependencies['react-dom']
      }));
  });

  it('add plugin import to the gasket file', async function () {
    await plugin.hooks.create.handler({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginNextjs', name);
  });

  it('adds appropriate devDependencies', async function () {
    mockContext.nextDevProxy = true;
    await plugin.hooks.create.handler({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      nodemon: devDependencies.nodemon
    });
  });

  it('adds the appropriate globs for redux', async function () {
    mockContext.useRedux = true;
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.files.add).toHaveBeenCalledWith(
      `${root}/../generator/redux/*`,
      `${root}/../generator/redux/**/*`
    );
  });

  it('adds appropriate dependencies for redux', async function () {
    mockContext.useRedux = true;
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
    });
  });

  it('does not add dependencies or globs for redux', async function () {
    mockContext.useRedux = false;
    await plugin.hooks.create.handler({}, mockContext);

    expect(mockContext.pkg.add).not.toHaveBeenCalledWith('dependencies', {
      'next-redux-wrapper': devDependencies['next-redux-wrapper'],
      'lodash.merge': devDependencies['lodash.merge']
    });
    expect(mockContext.files.add).not.toHaveBeenCalledWith(
      `${root}/../generator/redux/*`,
      `${root}/../generator/redux/**/*`
    );
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
    mockContext.nextDevProxy = true;
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
      'local': 'next dev'
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
