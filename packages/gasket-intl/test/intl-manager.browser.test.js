import { LocaleHandler } from '../lib/locale-handler.js';
import { pause } from './helpers.js';

const allKeys = ['locales/en-US', 'locales/fr-FR', 'locales/ar-AE'];

const expectedRegister = {
  'locales/en-US': { key: 'value' },
  'locales/fr-FR': { key: 'valeur' },
  'locales/ar-AE': { key: 'قيمة' }
};

describe('InternalIntlManager', () => {
  let IntlManager, initSpy, loadSpy, getElementByIdSpy;
  let manager, mockManifest;

  beforeEach(async () => {
    mockManifest = {
      defaultLocale: 'en-US',
      locales: ['en-US', 'fr-FR', 'ar-AE'],
      imports: {
        'locales/en-US': vi.fn(() => Promise.resolve({ default: { key: 'value' } })),
        'locales/fr-FR': vi.fn(() => Promise.resolve({ default: { key: 'valeur' } })),
        'locales/ar-AE': vi.fn(() => Promise.resolve({ default: { key: 'قيمة' } }))
      }
    };

    const mod = await import('../lib/internal-intl-manager.js');
    IntlManager = mod.InternalIntlManager;
    initSpy = vi.spyOn(IntlManager.prototype, 'init');
    loadSpy = vi.spyOn(IntlManager.prototype, 'load');

    getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue({
      textContent: JSON.stringify(expectedRegister)
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('.init', () => {
    it('loads document-rendered preload register', async () => {
      expect(initSpy).not.toHaveBeenCalled();

      manager = new IntlManager(mockManifest);
      expect(initSpy).toHaveBeenCalled();

      expect(getElementByIdSpy).toHaveBeenCalledWith('GasketIntl');

      allKeys.forEach((key) => {
        expect(manager.getMessages(key)).not.toBeUndefined();
        expect(manager.getMessages(key)).toEqual(expectedRegister[key]);
      });

      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('.handleLocale', () => {
    it('returns a singleton LocaleHandler instance', async () => {
      manager = new IntlManager(mockManifest);
      await pause();

      const handler1 = manager.handleLocale('en-US');
      const handler2 = manager.handleLocale('en-US');

      expect(handler1).toBeInstanceOf(LocaleHandler);
      expect(handler1).toBe(handler2);
    });
  });
});
