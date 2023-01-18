const path = require('path');
const mockWriteFileStub = jest.fn().mockResolvedValue((...args) => { args[args.length - 1](null, true); });

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
        log: jest.fn(),
        warning: jest.fn(),
        error: jest.fn()
      },
      config: {
        intl: {
          basePath: '',
          defaultPath: '/locales',
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-FR', 'fr-CH'],
          localesMap: {
            'fr-CH': 'fr-FR'
          },
          localesDir: path.join(__dirname, 'fixtures', 'locales'),
          manifestFilename: 'mock-manifest.json'
        }
      }
    };
  });

  afterEach(function () {
    mockWriteFileStub.mockResolvedValue((...args) => { args[args.length - 1](null, true); });
  });

  const getOutput = () => JSON.parse(mockWriteFileStub.mock.calls[0][1]);

  it('writes a json file in the locales dir', async function () {
    const expected = path.join(__dirname, 'fixtures', 'locales', 'mock-manifest.json');
    await buildManifest(mockGasket);
    expect(mockWriteFileStub).toHaveBeenCalled();
    expect(mockWriteFileStub.mock.calls[0][0]).toEqual(expected);
  });

  it('logs error if failed to write manifest', async function () {
    mockWriteFileStub.mockRejectedValue(new Error('Bad things man'));
    await expect(async () => { await buildManifest(mockGasket); }).rejects.toThrow('Bad things man');
    expect(mockGasket.logger.error).toHaveBeenCalledWith('build:locales: Unable to write locales manifest.');
  });

  it('logs warning if no locale files found', async function () {
    mockGasket.config.intl.localesDir = 'bogus';
    await buildManifest(mockGasket);
    expect(mockGasket.logger.warning).toHaveBeenCalledWith(expect.stringContaining('build:locales: No locale files found'));
  });

  it('includes expected properties in output', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    const keys = Object.keys(output);
    expect(keys).toEqual([
      'basePath', 'defaultPath', 'defaultLocale', 'locales', 'localesMap', 'paths'
    ]);
  });

  it('associates content hashes to locale path', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output.paths['locales/en-US.json']).toEqual('10decbe');
    expect(output.paths['locales/extra/en-US.json']).toEqual('ff5a352');
  });

  it('does not include any existing manifest in paths', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output.paths['mock-manifest.json']).toBeFalsy();
  });

  it('includes expected files in paths', async function () {
    await buildManifest(mockGasket);
    const output = getOutput();
    expect(output.paths).toEqual({
      'locales/en-US.json': '10decbe',
      'locales/extra/en-US.json': 'ff5a352',
      'locales/extra/fr-FR.json': '2155926',
      'locales/fr-FR.json': '21047f1'
    });
  });
});
