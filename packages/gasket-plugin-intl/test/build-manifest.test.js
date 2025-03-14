const path = require('path');
const mockWriteFileStub = jest.fn().mockResolvedValue((...args) => {
  args[args.length - 1](null, true);
});

jest.mock('fs', () => {
  const mod = jest.requireActual('fs');

  return {
    ...mod,
    promises: {
      ...mod.promises,
      writeFile: mockWriteFileStub
    }
  };
});

const buildManifest = require('../lib/build-manifest');

describe('buildManifest', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      },
      config: {
        root: path.join(__dirname, 'fixtures'),
        intl: {
          defaultLocaleFilePath: 'locales',
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-FR', 'fr-CH'],
          localesMap: {
            'fr-CH': 'fr-FR'
          },
          localesDir: path.join('locales'),
          managerFilename: 'intl.js'
        }
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();

    mockWriteFileStub.mockResolvedValue((...args) => {
      args[args.length - 1](null, true);
    });
  });

  const getOutput = () => mockWriteFileStub.mock.calls[0][1];

  it('writes a manager js file in the root dir', async function () {
    await buildManifest(mockGasket);
    expect(mockWriteFileStub).toHaveBeenCalled();
    expect(mockWriteFileStub.mock.calls[0][0]).toContain(path.join('fixtures', 'intl.js'));
  });

  it('writes a different named manager js file to target dir', async function () {
    mockGasket.config.intl.managerFilename = 'custom/intl-manager.js';
    await buildManifest(mockGasket);
    expect(mockWriteFileStub).toHaveBeenCalled();
    expect(mockWriteFileStub.mock.calls[0][0]).toContain(path.join('fixtures', 'custom', 'intl-manager.js'));
  });

  it('logs error if failed to write manifest', async function () {
    mockWriteFileStub.mockRejectedValue(new Error('Bad things man'));
    await expect(async () => {
      await buildManifest(mockGasket);
    }).rejects.toThrow('Bad things man');
    expect(mockGasket.logger.error).toHaveBeenCalledWith(
      'build:locales: Unable to write intl manager (intl.js).'
    );
  });

  it('logs warning if no locale files found', async function () {
    mockGasket.config.intl.localesDir = 'bogus';
    await buildManifest(mockGasket);
    expect(mockGasket.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('build:locales: No locale files found')
    );
  });

  it('includes expected properties in output', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    [
      'defaultLocaleFilePath',
      'defaultLocale',
      'locales',
      'localesMap',
      'imports'
    ].forEach(key => {
      expect(output).toContain(key);
    });
  });

  it('includes manifest const', async () => {
    await buildManifest(mockGasket);
    const expected = 'const manifest = {';
    expect(getOutput()).toContain(expected);
  });

  it('includes makeIntlManager setup', async () => {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output).toContain(`import { makeIntlManager } from '@gasket/intl';`);
    expect(output).toContain(`export default makeIntlManager(manifest);`);
  });

  it('associates locale file keys to imports', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output).toContain(
      `'locales/en-US': () => import('./locales/en-US.json')`
    );
    expect(output).toContain(
      `'locales/fr-FR': () => import('./locales/fr-FR.json')`
    );
  });

  it('allows for experimental import attributes if configured', async function () {
    mockGasket.config.intl.experimentalImportAttributes = true;
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output).toContain(
      `'locales/en-US': () => import('./locales/en-US.json', { with: { type: 'json' } })`
    );
    expect(output).toContain(
      `'locales/fr-FR': () => import('./locales/fr-FR.json', { with: { type: 'json' } })`
    );
  });

  it('associates nested locale file keys to imports', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output).toContain(
      `'locales/extra/en-US': () => import('./locales/extra/en-US.json')`
    );
    expect(output).toContain(
      `'locales/extra/fr-FR': () => import('./locales/extra/fr-FR.json')`
    );
  });

  it('associates grouped locale file keys to imports', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output).toContain(
      `'locales/en-US/grouped': () => import('./locales/en-US/grouped.json')`
    );
    expect(output).toContain(
      `'locales/fr-FR/grouped': () => import('./locales/fr-FR/grouped.json')`
    );
  });

  it('.ts files include manifest types', async () => {
    mockGasket.config.intl.managerFilename = 'intl.ts';
    await buildManifest(mockGasket);
    const expected = 'const manifest: LocaleManifest = {';
    expect(getOutput()).toContain(expected);
  });

  it('.ts files include type imports', async () => {
    mockGasket.config.intl.managerFilename = 'intl.ts';
    await buildManifest(mockGasket);
    const expected = `import type { LocaleManifest } from '@gasket/intl';`;
    expect(getOutput()).toContain(expected);
  });
});
