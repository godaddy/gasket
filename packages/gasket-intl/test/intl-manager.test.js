import { LocaleFileStatus } from '../lib/index.js';
import { LocaleHandler } from '../lib/locale-handler.js';
import { pause } from './helpers.js';

const allKeys = ['locales/en-US', 'locales/fr-FR', 'locales/ar-AE'];

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
});

const expectedRegister = {
  'locales/en-US': { key: 'value' },
  'locales/fr-FR': { key: 'valeur' },
  'locales/ar-AE': { key: 'قيمة' }
};

describe('InternalIntlManager', () => {
  let IntlManager, initSpy, loadSpy;
  let manager, mockManifest, localeFileKey;

  beforeEach(async () => {
    localeFileKey = 'locales/en-US';

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('.init', () => {
    it('loads all manifest imports', async () => {
      expect(initSpy).not.toHaveBeenCalled();

      manager = new IntlManager(mockManifest);
      expect(initSpy).toHaveBeenCalled();
      await pause();

      allKeys.forEach(key => {
        expect(loadSpy).toHaveBeenCalledWith(key);
        expect(manager.getMessages(key)).not.toBeUndefined();
        expect(manager.getMessages(key)).toEqual(expectedRegister[key]);
      });
    });

    it('logs when completed', async () => {
      expect(consoleLogSpy).not.toHaveBeenCalled();
      manager = new IntlManager(mockManifest);
      expect(initSpy).toHaveBeenCalled();
      await pause();

      expect(consoleLogSpy).toHaveBeenCalledWith('Server preloading locales complete');
    });
  });

  describe('.managedLocales', () => {
    it('returns available locales', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.managedLocales).toEqual(mockManifest.locales);
    });

    it('includes mapped locales', () => {
      mockManifest.localesMap = {
        'fr-CA': 'fr-FR'
      };
      manager = new IntlManager(mockManifest);
      expect(manager.managedLocales).toEqual([...mockManifest.locales, 'fr-CA']);
    });
  });

  describe('.locales', () => {
    it('returns configured locales', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.locales).toEqual(mockManifest.locales);
    });
  });

  describe('.defaultLocaleFilePath', () => {
    it('returns configured', () => {
      mockManifest.defaultLocaleFilePath = 'locales';
      manager = new IntlManager(mockManifest);
      expect(manager.defaultLocaleFilePath).toEqual('locales');
    });

    it('returns undefined if not configured', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.defaultLocaleFilePath).toBeUndefined();
    });
  });

  describe('.staticLocaleFilePaths', () => {
    it('returns configured', () => {
      mockManifest.staticLocaleFilePaths = ['locales'];
      manager = new IntlManager(mockManifest);
      expect(manager.staticLocaleFilePaths).toEqual(['locales']);
    });

    it('returns empty array if not configured', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.staticLocaleFilePaths).toEqual([]);
    });
  });

  describe('.resolveLocale', () => {

    it('resolves locale when supported', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('fr-FR')).toEqual('fr-FR');
    });

    it('resolves default with unsupported locale', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('en-CA')).toEqual('en-US');
    });

    it('resolves default with unsupported lang', () => {
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('en')).toEqual('en-US');
    });

    it('resolves lang when supported', () => {
      mockManifest.locales = ['en', 'fr'];
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('fr-CA')).toEqual('fr');
    });

    it('resolves lang from locale when supported', () => {
      mockManifest.locales = ['en', 'fr'];
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('fr-CA')).toEqual('fr');
    });

    it('resolves mapped locales', () => {
      mockManifest.localesMap = {
        'fr-CA': 'fr-FR'
      };
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('fr-CA')).toEqual('fr-FR');
    });

    it('resolves mapped lang', () => {
      mockManifest.localesMap = {
        fr: 'fr-FR'
      };
      manager = new IntlManager(mockManifest);
      expect(manager.resolveLocale('fr-CA')).toEqual('fr-FR');
    });
  });

  describe('.load', () => {
    const mockLocaleFileKey = 'fake-LOCALE';

    beforeEach(() => {
      manager = new IntlManager(mockManifest);
      mockManifest.imports[mockLocaleFileKey] = vi.fn(async () => {
        await pause(5);
        return { default: { key: 'fake' } };
      });
    });

    it('registers imported messages and status', async () => {
      expect(manager.getMessages(mockLocaleFileKey)).toBeUndefined();
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.notLoaded);

      await manager.load(mockLocaleFileKey);

      expect(mockManifest.imports[mockLocaleFileKey]).toHaveBeenCalled();
      expect(manager.getMessages(mockLocaleFileKey)).toEqual({ key: 'fake' });
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.loaded);
    });

    it('dedupes promises for repeated requests', async () => {
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.notLoaded);

      const promise1 = manager.load(mockLocaleFileKey);
      const promise2 = manager.load(mockLocaleFileKey);

      expect(promise1).toBe(promise2);

      await promise1;

      expect(mockManifest.imports[mockLocaleFileKey]).toHaveBeenCalledTimes(1);
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.loaded);
    });

    it('registers loading status', async () => {
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.notLoaded);

      const promise = manager.load(mockLocaleFileKey);
      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.loading);

      await promise;

      expect(manager.getStatus(mockLocaleFileKey)).toEqual(LocaleFileStatus.loaded);
    });

    it('registers error status for missing keys', async () => {
      const missingLocaleFileKey = 'missing/locale/key';
      await manager.load(missingLocaleFileKey);

      expect(manager.getMessages(missingLocaleFileKey)).toBeUndefined();
      expect(manager.getStatus(missingLocaleFileKey)).toEqual(LocaleFileStatus.error);
    });

    it('registers error status for bad imports', async () => {
      const mockError = new Error('BOOM!');
      const badLocaleFileKey = 'missing/locale/key';
      mockManifest.imports[badLocaleFileKey] = vi.fn(async () => {
        throw mockError;
      });

      await manager.load(badLocaleFileKey);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load locale path missing/locale/key', mockError);

      expect(manager.getMessages(badLocaleFileKey)).toBeUndefined();
      expect(manager.getStatus(badLocaleFileKey)).toEqual(LocaleFileStatus.error);
    });
  });

  describe('.getMessages', () => {
    it('returns registered messages', async () => {
      manager = new IntlManager(mockManifest);
      await pause();

      expect(manager.getMessages(localeFileKey)).toEqual({ key: 'value' });
    });

    it('returns undefined if no messages', async () => {
      manager = new IntlManager(mockManifest);
      await pause();

      expect(manager.getMessages('missingLocaleFileKey')).toBeUndefined();
    });
  });

  describe('.getStatus', () => {

    it('returns `notLoaded`', async () => {
      manager = new IntlManager(mockManifest);
      await pause();

      expect(manager.getStatus('missingLocaleFileKey')).toEqual(LocaleFileStatus.notLoaded);
    });

    it('returns `loading`', async () => {
      manager = new IntlManager(mockManifest);

      expect(manager.getStatus('locales/en-US')).toEqual(LocaleFileStatus.loading);
      await pause();

      expect(manager.getStatus('locales/en-US')).toEqual(LocaleFileStatus.loaded);
    });

    it('returns `loaded`', async () => {
      manager = new IntlManager(mockManifest);
      await pause();

      expect(manager.getStatus(localeFileKey)).toEqual(LocaleFileStatus.loaded);
    });

    it('returns `error`', async () => {
      mockManifest.imports['locales/en-US'] = vi.fn(async () => {
        throw new Error('BOOM!');
      });

      manager = new IntlManager(mockManifest);
      await pause();

      expect(manager.getStatus(localeFileKey)).toEqual(LocaleFileStatus.error);
    });
  });

  describe('.handleLocale', () => {
    it('returns a unique LocaleHandler instance', () => {
      manager = new IntlManager(mockManifest);
      pause();

      const handler1 = manager.handleLocale('en-US');
      const handler2 = manager.handleLocale('en-US');

      expect(handler1).toBeInstanceOf(LocaleHandler);
      expect(handler1).not.toBe(handler2);
    });
  });
});
