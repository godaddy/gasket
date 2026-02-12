import plugin from '../lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { devDependencies, name, version } = require('../package.json');

describe('create', function () {
  let mockGasket;
  let mockContext;
  let pkgHasStub;
  let pkgAddStub;
  let filesAddStub;
  let addPluginStub;
  let addStub;

  beforeEach(function () {
    pkgHasStub = vi.fn().mockReturnValue(true);
    pkgAddStub = vi.fn();
    filesAddStub = vi.fn();
    addPluginStub = vi.fn();
    addStub = vi.fn();

    mockGasket = {
      config: {
        intl: {}
      }
    };

    mockContext = {
      pkg: {
        add: pkgAddStub,
        has: pkgHasStub
      },
      files: {
        add: filesAddStub
      },
      gasketConfig: {
        addPlugin: addPluginStub,
        add: addStub
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds the appropriate globs', async function () {
    await plugin.hooks.create(mockGasket, mockContext);
    expect(filesAddStub).toHaveBeenCalledWith(
      expect.stringContaining('/generator/*'),
      expect.stringContaining('/generator/**/*')
    );
  });

  it('does not add intl dependencies when react is not found', async function () {
    pkgHasStub.mockReturnValue(false);
    const reactIntlDependencies = {
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    };
    expect(pkgAddStub).not.toHaveBeenCalledWith('dependencies', reactIntlDependencies);
  });

  it('adds the appropriate dependencies', async function () {
    await plugin.hooks.create(mockGasket, mockContext);
    expect(pkgAddStub.mock.calls[0]).toEqual(['dependencies', {
      [name]: `^${version}`
    }]);
    expect(pkgAddStub.mock.calls[1]).toEqual(['dependencies', {
      '@gasket/intl': devDependencies['@gasket/intl'],
      '@gasket/react-intl': devDependencies['@gasket/react-intl'],
      'react-intl': devDependencies['react-intl']
    }]);
  });

  it('adds the default intl.locales config', async function () {
    await plugin.hooks.create(mockGasket, mockContext);
    expect(addStub).toHaveBeenCalledWith('intl', {
      locales: ['en-US', 'fr-FR'],
      nextRouting: false
    });
  });

  it('adds the default intl.nextRouting config', async function () {
    await plugin.hooks.create(mockGasket, mockContext);
    expect(mockGasket.config.intl.nextRouting).toBe(false);
  });

  it('does nothing if hasGasketIntl is false', async function () {
    mockContext.hasGasketIntl = false;
    await plugin.hooks.create(mockGasket, mockContext);
    expect(pkgAddStub).not.toHaveBeenCalled();
    expect(filesAddStub).not.toHaveBeenCalled();
    expect(addStub).not.toHaveBeenCalled();
  });

  it('adjusts config for typescript', async function () {
    mockContext.typescript = true;
    await plugin.hooks.create(mockGasket, mockContext);
    expect(addStub).toHaveBeenCalledWith('intl', {
      locales: ['en-US', 'fr-FR'],
      managerFilename: 'intl.ts',
      defaultLocale: 'en-US',
      nextRouting: false
    });
  });

  it('adjusts current config generating intl file', async function () {
    expect(mockGasket.config.intl.locales).toBeUndefined();
    expect(mockGasket.config.intl.managerFilename).toBeUndefined();

    await plugin.hooks.create(mockGasket, mockContext);
    expect(mockGasket.config.intl.locales).toEqual(['en-US', 'fr-FR']);
    expect(mockGasket.config.intl.managerFilename).toEqual('intl.js');

    mockContext.typescript = true;
    await plugin.hooks.create(mockGasket, mockContext);
    expect(mockGasket.config.intl.managerFilename).toEqual('intl.ts');
  });
});
