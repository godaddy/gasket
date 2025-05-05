import { makeIntlManager, LocaleFileStatus } from '../lib/index.js';

describe('makeIntlManager', () => {
  const mockManifest = {
    locales: ['en', 'fr'],
    imports: {
      'locales/en': () => Promise.resolve({ default: { greeting: 'Hello' } }),
      'locales/fr': () => Promise.resolve({ default: { greeting: 'Bonjour' } })
    }
  };

  it('creates an IntlManager instance with the given manifest', () => {
    const manager = makeIntlManager(mockManifest);

    expect(manager).toBeDefined();
    expect(manager.locales).toEqual(['en', 'fr']);
    expect(manager.managedLocales).toContain('en');
    expect(typeof manager.load).toBe('function');
    expect(typeof manager.getMessages).toBe('function');
  });

  it('loads a locale and updates messages/status', async () => {
    const manager = makeIntlManager(mockManifest);

    await manager.load('locales/en');

    expect(manager.getMessages('locales/en')).toEqual({ greeting: 'Hello' });
    expect(manager.getStatus('locales/en')).toBe(LocaleFileStatus.loaded);
  });

  it('returns error status for unknown locale key', async () => {
    const manager = makeIntlManager(mockManifest);

    await manager.load('locales/it');

    expect(manager.getStatus('locales/it')).toBe(LocaleFileStatus.error);
    expect(manager.getMessages('locales/it')).toBeUndefined();
  });
});
