/* eslint-disable no-sync */
const actions = require('../lib/actions');

const mockIntlManager = {};

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
      execWaterfall: jest.fn().mockImplementation((lifecycle, content) => content),
      config: {
        intl: {
          manager: mockIntlManager,
          defaultLocale: 'en'
        }
      }
    };
  });

  it('should return an object', () => {
    expect(actions()).toBeInstanceOf(Object);
  });

  describe('getIntlLocale', () => {
    it('executes expected lifecycle', async function () {
      await actions(mockGasket).getIntlLocale(req);
      expect(mockGasket.execWaterfall).toHaveBeenCalledWith('intlLocale', mockLocale, { req });
    });

    it('should return the locale from the request map if it exists', async () => {
      const result = await actions(mockGasket).getIntlLocale(req);
      expect(result).toBe(mockLocale);
    });
  });

  describe('getIntlManager', () => {
    it('should return the configured manager', () => {
      const result = actions(mockGasket).getIntlManager();
      expect(result).toBe(mockIntlManager);
    });

    it('should throw if manager not configured', () => {
      delete mockGasket.config.intl.manager;
      expect(() => actions(mockGasket).getIntlManager())
        .toThrow('IntlManager not configured (gasket.config.intl.manager)');
    });
  });
});
