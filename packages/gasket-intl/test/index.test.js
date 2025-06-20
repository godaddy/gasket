import { makeIntlManager, LocaleFileStatus } from '../lib/index.js';

describe('makeIntlManager', () => {
  const mockManifest = {
    locales: ['en', 'fr'],
    imports: {
      'locales/en': () => Promise.resolve({ default: { greeting: 'Hello' } }),
      'locales/fr': () => Promise.resolve({ default: { greeting: 'Bonjour' } }),
      // Add the keys that will be generated by LocaleHandler.getLocaleFileKey
      'locales/en/en': () => Promise.resolve({ default: { greeting: 'Hello' } }),
      'locales/fr/fr': () => Promise.resolve({ default: { greeting: 'Bonjour' } })
      // Removed 'locales/it/en' to test the error case
    }
  };

  it('creates an IntlManager instance with the given manifest', () => {
    const provider = makeIntlManager(mockManifest);

    expect(provider).toBeDefined();
    expect(provider.locales).toEqual(['en', 'fr']);
    expect(typeof provider.resolveLocale).toBe('function');
    expect(typeof provider.handleLocale).toBe('function');
  });

  it('loads a locale and updates messages/status through LocaleHandler', async () => {
    const provider = makeIntlManager(mockManifest);
    const localeHandler = provider.handleLocale('en');

    await localeHandler.load('locales/en');

    expect(localeHandler.getAllMessages()).toEqual({ greeting: 'Hello' });
    expect(localeHandler.getStatus('locales/en')).toBe(LocaleFileStatus.loaded);
  });

  it('returns error status for unknown locale key', async () => {
    const provider = makeIntlManager(mockManifest);
    const localeHandler = provider.handleLocale('en');

    await localeHandler.load('locales/it');

    expect(localeHandler.getStatus('locales/it')).toBe(LocaleFileStatus.error);
  });
});
