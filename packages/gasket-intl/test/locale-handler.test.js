import { jest } from '@jest/globals';
import { LocaleFileStatus } from '../lib/constants.js';
import { LocaleHandler, lowestStatus } from '../lib/locale-handler.js';
import { pause } from './helpers.js';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });


describe('LocaleHandler', () => {
  let IntlManager, managerLoadSpy, managerGetStatusSpy;
  let manager, mockManifest;

  beforeEach(async () => {
    mockManifest = {
      defaultLocale: 'en-US',
      locales: ['en-US', 'fr-FR', 'ar-AE'],
      localesMap: {
        fr: 'fr-FR'
      },
      defaultLocaleFilePath: 'locales',
      imports: {
        'locales/en-US': jest.fn(() => Promise.resolve({ default: { key: 'value' } })),
        'locales/fr-FR': jest.fn(() => Promise.resolve({ default: { key: 'valeur' } })),
        'locales/ar-AE': jest.fn(() => Promise.resolve({ default: { key: 'قيمة' } }))
      }
    };

    const mod = await import('../lib/intl-manager.js');
    IntlManager = mod.IntlManager;
    managerLoadSpy = jest.spyOn(IntlManager.prototype, 'load');
    managerGetStatusSpy = jest.spyOn(IntlManager.prototype, 'getStatus');
    manager = new IntlManager(mockManifest);
    await pause();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('.getLocaleFileKey', () => {
    it('resolves with defaultLocaleFileKey', () => {
      const handler = new LocaleHandler(manager, 'en-US');

      expect(handler.getLocaleFileKey()).toEqual('locales/en-US');
    });

    it('resolves basic path', () => {
      const handler = new LocaleHandler(manager, 'en-US');

      expect(handler.getLocaleFileKey('locales'))
        .toEqual('locales/en-US');
    });

    it('resolves nested path', () => {
      const handler = new LocaleHandler(manager, 'en-US');

      expect(handler.getLocaleFileKey('locales/nested'))
        .toEqual('locales/nested/en-US');
    });

    it('resolves grouped path', () => {
      const handler = new LocaleHandler(manager, 'en-US');

      expect(handler.getLocaleFileKey('locales/:locale/grouped'))
        .toEqual('locales/en-US/grouped');
    });

    it('resolves with default locale', () => {
      const handler = new LocaleHandler(manager, 'es-MX');

      expect(handler.locale).toEqual('es-MX');
      expect(handler.resolvedLocale).toEqual('en-US');

      expect(handler.getLocaleFileKey('locales/:locale/grouped'))
        .toEqual('locales/en-US/grouped');
    });

    it('resolves with mapped locale', () => {
      const handler = new LocaleHandler(manager, 'fr-CA');

      expect(handler.locale).toEqual('fr-CA');
      expect(handler.resolvedLocale).toEqual('fr-FR');

      expect(handler.getLocaleFileKey('locales/:locale/grouped'))
        .toEqual('locales/fr-FR/grouped');
    });
  });

  describe('.load', () => {
    it('loads single path', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load('locales');

      expect(managerLoadSpy).toHaveBeenCalledTimes(1);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');

      const status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('loads default path', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();

      expect(managerLoadSpy).toHaveBeenCalledTimes(1);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');

      const status = handler.getStatus(manager.defaultLocaleFilePath);
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('loads multiple paths', () => {
      const handler = new LocaleHandler(manager, 'en-US');
      handler.load('locales', 'locales/nested', 'locales/:locale/grouped');

      expect(managerLoadSpy).toHaveBeenCalledTimes(3);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/nested/en-US');
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US/grouped');
    });

    it('marks localeFileKeys as handled', () => {
      const handler = new LocaleHandler(manager, 'en-US');
      handler.load('locales', 'locales/nested', 'locales/:locale/grouped');

      expect(handler.handledKeys).toEqual(['locales/en-US', 'locales/nested/en-US', 'locales/en-US/grouped']);
    });
  });

  describe('.loadStatics', () => {
    it('preloads single path', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.loadStatics('locales');

      expect(managerLoadSpy).toHaveBeenCalledTimes(1);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');
      expect(handler.staticKeys).toEqual(['locales/en-US']);

      const status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('preloads default path', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.loadStatics();

      expect(managerLoadSpy).toHaveBeenCalledTimes(1);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');
      expect(handler.staticKeys).toEqual(['locales/en-US']);

      const status = handler.getStatus(manager.defaultLocaleFilePath);
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('preloads multiple paths', () => {
      const handler = new LocaleHandler(manager, 'en-US');
      handler.loadStatics('locales', 'locales/nested', 'locales/:locale/grouped');

      expect(managerLoadSpy).toHaveBeenCalledTimes(3);
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US');
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/nested/en-US');
      expect(managerLoadSpy).toHaveBeenCalledWith('locales/en-US/grouped');
      expect(handler.staticKeys).toEqual(['locales/en-US', 'locales/nested/en-US', 'locales/en-US/grouped']);
    });

    it('marks localeFileKeys as handled and preloaded', () => {
      const handler = new LocaleHandler(manager, 'en-US');
      handler.loadStatics('locales', 'locales/nested', 'locales/:locale/grouped');

      expect(handler.handledKeys).toEqual(['locales/en-US', 'locales/nested/en-US', 'locales/en-US/grouped']);
      expect(handler.staticKeys).toEqual(['locales/en-US', 'locales/nested/en-US', 'locales/en-US/grouped']);
    });
  });

  describe('.getStatus', () => {
    it('`notHandled` until preloaded', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      await handler.load('locales');
      status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('`notHandled` until loaded', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      await handler.load('locales');
      status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('`notLoaded` if handled but not loaded', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      // inject handled key for testing
      handler.handledKeys.push('locales/extra/en-US');

      status = handler.getStatus('locales/extra');
      expect(status).toEqual(LocaleFileStatus.notLoaded);
    });

    it('`loading` if handled but still loading', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales/extra');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      // inject handled key for testing
      handler.handledKeys.push('locales/extra/en-US');
      manager.statusRegister['locales/extra/en-US'] = LocaleFileStatus.loading;

      status = handler.getStatus('locales/extra');
      expect(status).toEqual(LocaleFileStatus.loading);
    });

    it('`loaded` if handled and loaded', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      await handler.load('locales');
      status = handler.getStatus('locales');
      expect(status).toEqual(LocaleFileStatus.loaded);
    });

    it('`error` if handled and error', async () => {
      const handler = new LocaleHandler(manager, 'en-US');

      let status = handler.getStatus('locales/extra');
      expect(status).toEqual(LocaleFileStatus.notHandled);

      // inject handled key for testing
      handler.handledKeys.push('locales/extra/en-US');
      // inject statusRegister for testing
      manager.statusRegister['locales/extra/en-US'] = LocaleFileStatus.error;

      status = handler.getStatus('locales/extra');
      expect(status).toEqual(LocaleFileStatus.error);
    });

    it('gets single path status', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load('locales');
      const status = handler.getStatus('locales');

      expect(status).toEqual(LocaleFileStatus.loaded);

      expect(managerGetStatusSpy).toHaveBeenCalledTimes(1);
      expect(managerGetStatusSpy).toHaveBeenCalledWith('locales/en-US');
    });

    it('gets default path status', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();
      const status = handler.getStatus();

      expect(status).toEqual(LocaleFileStatus.loaded);

      expect(managerGetStatusSpy).toHaveBeenCalledTimes(1);
      expect(managerGetStatusSpy).toHaveBeenCalledWith('locales/en-US');
    });

    // eslint-disable-next-line max-statements
    it('gets least priority multiple path status', () => {
      const handler = new LocaleHandler(manager, 'en-US');
      handler.load('locales', 'locales/nested', 'locales/:locale/grouped');

      let status = handler.getStatus('locales', 'locales/nested', 'locales/:locale/grouped');
      expect(status).toEqual(LocaleFileStatus.error);

      expect(managerGetStatusSpy).toHaveBeenCalledTimes(3);
      expect(managerGetStatusSpy).toHaveBeenCalledWith('locales/en-US');
      expect(managerGetStatusSpy).toHaveBeenCalledWith('locales/nested/en-US');
      expect(managerGetStatusSpy).toHaveBeenCalledWith('locales/en-US/grouped');

      // inject statusRegister for testing
      manager.statusRegister['locales/nested/en-US'] = LocaleFileStatus.loading;
      manager.statusRegister['locales/en-US/grouped'] = LocaleFileStatus.loading;

      status = handler.getStatus('locales', 'locales/nested', 'locales/:locale/grouped');
      expect(status).toEqual(LocaleFileStatus.loading);

      // inject statusRegister for testing
      manager.statusRegister['locales/nested/en-US'] = LocaleFileStatus.loading;
      manager.statusRegister['locales/en-US/grouped'] = LocaleFileStatus.notLoaded;

      status = handler.getStatus('locales', 'locales/nested', 'locales/:locale/grouped');
      expect(status).toEqual(LocaleFileStatus.notLoaded);
    });
  });

  describe('.getAllMessages', () => {
    beforeEach(() => {
      mockManifest.imports['locales/nested/en-US'] = jest.fn(() => Promise.resolve({
        default:
          { extra: 'extra' }
      }));
      mockManifest.imports['locales/override/en-US'] = jest.fn(() => Promise.resolve({
        default: {
          extra: 'override',
          key: 'override',
          override: 'yes!'
        }
      }));
    });

    it('returns all messages', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();

      const messages = handler.getAllMessages();

      expect(messages).toEqual({
        key: 'value'
      });
    });

    it('returns all messages for locale', async () => {
      const handler = new LocaleHandler(manager, 'fr-FR');
      await handler.load();

      const messages = handler.getAllMessages();

      expect(messages).toEqual({
        key: 'valeur'
      });
    });

    it('returns messages for only handled keys', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();

      let messages = handler.getAllMessages();

      expect(messages).toEqual({
        key: 'value'
      });

      await handler.load('locales/nested');

      messages = handler.getAllMessages();

      expect(messages).toEqual({
        extra: 'extra',
        key: 'value'
      });

      // manipulate handledKeys for testing
      handler.handledKeys.pop();
      handler.handledDirty = true;

      messages = handler.getAllMessages();

      expect(messages).toEqual({
        key: 'value'
      });
    });

    it('returns messages in handled order', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();

      let messages = handler.getAllMessages();

      expect(messages).toEqual({
        key: 'value'
      });

      await handler.load('locales/nested', 'locales/override');

      messages = handler.getAllMessages();

      expect(messages).toEqual({
        extra: 'override',
        key: 'override',
        override: 'yes!'
      });

      // manipulate handledKeys for testing
      handler.handledKeys.reverse();
      handler.handledDirty = true;

      messages = handler.getAllMessages();

      expect(messages).toEqual({
        extra: 'extra',
        key: 'value',
        override: 'yes!'
      });
    });

    it('returns same messages instance when not dirty', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.load();

      const messages = handler.getAllMessages();
      const messages2 = handler.getAllMessages();

      expect(messages).toBe(messages2);

      await handler.load('locales/nested');
      const messages3 = handler.getAllMessages();

      expect(messages).not.toBe(messages3);
    });
  });

  describe('.getStaticsRegister', () => {
    beforeEach(() => {
      mockManifest.imports['locales/nested/en-US'] = jest.fn(() => Promise.resolve({
        default:
          { extra: 'extra' }
      }));
      mockManifest.imports['locales/override/en-US'] = jest.fn(() => Promise.resolve({
        default: {
          extra: 'override',
          key: 'override',
          override: 'yes!'
        }
      }));
    });

    it('returns all register', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.loadStatics();

      const register = handler.getStaticsRegister();

      expect(register).toEqual({
        'locales/en-US': {
          key: 'value'
        }
      });
    });

    it('returns all register for locale', async () => {
      const handler = new LocaleHandler(manager, 'fr-FR');
      await handler.loadStatics();

      const register = handler.getStaticsRegister();

      expect(register).toEqual({
        'locales/fr-FR': {
          key: 'valeur'
        }
      });
    });

    it('returns register for only preload keys', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.loadStatics();

      let register = handler.getStaticsRegister();

      expect(register).toEqual({
        'locales/en-US': {
          key: 'value'
        }
      });

      await handler.loadStatics('locales/nested');

      register = handler.getStaticsRegister();

      expect(register).toEqual({
        'locales/en-US': {
          key: 'value'
        },
        'locales/nested/en-US': {
          extra: 'extra'
        }
      });
    });

    it('returns same register instance when not dirty', async () => {
      const handler = new LocaleHandler(manager, 'en-US');
      await handler.loadStatics();

      const register = handler.getStaticsRegister();
      const register2 = handler.getStaticsRegister();

      expect(register).toBe(register2);

      await handler.loadStatics('locales/nested');
      const register3 = handler.getStaticsRegister();

      expect(register).not.toBe(register3);
    });
  });
});

describe('lowestStatus', () => {
  let statuses;

  it('returns `notHandled` if any notHandled', () => {
    statuses = [LocaleFileStatus.notHandled, LocaleFileStatus.notLoaded, LocaleFileStatus.error, LocaleFileStatus.loaded];
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.notHandled);

    statuses.reverse();
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.notHandled);
  });

  it('returns `notLoaded` if any notHandled', () => {
    statuses = [LocaleFileStatus.notLoaded, LocaleFileStatus.loading, LocaleFileStatus.error, LocaleFileStatus.loaded];
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.notLoaded);

    statuses.reverse();
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.notLoaded);
  });

  it('returns `loading` if any loading', () => {
    statuses = [LocaleFileStatus.loading, LocaleFileStatus.loaded, LocaleFileStatus.error, LocaleFileStatus.loaded];
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.loading);

    statuses.reverse();
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.loading);
  });

  it('returns `error` if any error', () => {
    statuses = [LocaleFileStatus.error, LocaleFileStatus.loaded];
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.error);

    statuses.reverse();
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.error);
  });

  it('returns `loaded` if all loaded', () => {
    statuses = [LocaleFileStatus.loaded, LocaleFileStatus.loaded, LocaleFileStatus.loaded];
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.loaded);

    statuses.reverse();
    expect(lowestStatus(statuses)).toEqual(LocaleFileStatus.loaded);
  });
});
