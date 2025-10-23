import actions from '../lib/actions.js';
const { getIntlLocale, getIntlManager } = actions;

describe('actions', () => {
  let req, mockGasket, mockLocale;

  beforeEach(() => {
    mockLocale = 'en-CA';
    req = {
      headers: {
        'accept-language': mockLocale
      }
    };
    mockGasket = {
      execWaterfall: vi.fn().mockImplementation((lifecycle, content) => content),
      config: {
        root: `${import.meta.url.replace('file://', '').replace('/test/actions.test.js', '')}/test/fixtures/gasket-root`,
        intl: {
          managerFilename: 'intl.js',
          defaultLocale: 'en',
          experimentalImportAttributes: true
        }
      }
    };
  });

  it('should return an object', () => {
    expect({ getIntlLocale, getIntlManager }).toBeInstanceOf(Object);
  });

  describe('getIntlLocale', () => {
    it('executes expected lifecycle', async function () {
      await getIntlLocale(mockGasket, req);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith(
        'intlLocale',
        mockLocale,
        { req: expect.objectContaining(req) }
      );
    });

    it('should return the locale from the request map if it exists', async () => {
      const result = await getIntlLocale(mockGasket, req);
      expect(result).toBe(mockLocale);
    });
  });

  describe('getIntlManager', () => {
    it('should return the configured manager', async () => {
      mockGasket.config.intl.experimentalImportAttributes = true;
      const result = await getIntlManager(mockGasket);
      expect(result).toEqual({ default: {} });
    });

    it('should throw if manager not configured', async () => {
      delete mockGasket.config.intl.managerFilename;
      await expect(() => getIntlManager(mockGasket))
        .rejects
        .toThrow('IntlManager not configured (gasket.config.intl.managerFilename)');
    });

    it('should throw if experimental import attributes not configured', async () => {
      delete mockGasket.config.intl.experimentalImportAttributes;
      await expect(() => getIntlManager(mockGasket))
        .rejects
        .toThrow('To use experimental import attributes you must configure `gasket.config.intl.experimentalImportAttributes`');
    });
  });
});
