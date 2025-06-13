import { isBrowser, LocaleFileStatus } from './constants.js';
import { LocaleHandler } from './locale-handler.js';

/** @type {import('./index.d.ts').LocaleHandler} */
let _browserSingletonHandler;

/**
 * Utility class for loading locale files
 * @type {import('./internal.d.ts').InternalIntlManager}
 */
export class InternalIntlManager {
  /** @type {import('./internal.d.ts').MessagesRegister } */
  messagesRegister = {};
  /** @type {import('./internal.d.ts').StatusRegister } */
  statusRegister = {};
  /** @type {import('./internal.d.ts').PromisesRegister } */
  promisesRegister = {};

  /** @type {import('./internal.d.ts').IntlManager_constructor } */
  constructor(manifest) {
    this.manifest = manifest;
    this.managedLocales = [...this.locales, ...Object.keys(this.manifest.localesMap ?? {})];

    this.init();
  }

  get locales() {
    return this.manifest.locales;
  }

  get defaultLocaleFilePath() {
    return this.manifest.defaultLocaleFilePath;
  }

  get staticLocaleFilePaths() {
    return this.manifest.staticLocaleFilePaths ?? [];
  }

  /** @type {import('./internal.d.ts').IntlManager_resolveLocale } */
  resolveLocale(locale) {
    const { defaultLocale, locales, localesMap = {} } = this.manifest;

    if (locale in localesMap) {
      return localesMap[locale];
    }

    if (locales.includes(locale)) {
      return locale;
    }

    // attempt fallback to language
    if (locale.indexOf('-') > 0) {
      return this.resolveLocale(locale.split('-')[0]);
    }

    return defaultLocale;
  }

  /** @type {import('./internal.d.ts').IntlManager_init } */
  init() {
    if (isBrowser) {
      const content = (document.getElementById('GasketIntl') ?? {}).textContent;
      const data = content ? JSON.parse(content) : {};
      Object.keys(data).forEach((localeFileKey) => {
        this.statusRegister[localeFileKey] = LocaleFileStatus.loaded;
      });
      this.messagesRegister = data;
    } else {
      Promise.all(
        Object.keys(this.manifest.imports)
          .map((localeFileKey) => this.load(localeFileKey))
      ).then(() => {
        // eslint-disable-next-line no-console
        console.log('Server preloading locales complete');
      });
    }
  }

  /** @type {import('./internal.d.ts').IntlManager_load } */
  load(localeFileKey) {
    // Debounce multiple requests for the same locale
    // `load` cannot be async/await as that makes a new promise
    if (this.promisesRegister[localeFileKey]) {
      return this.promisesRegister[localeFileKey];
    }

    if (this.messagesRegister[localeFileKey]) {
      return Promise.resolve();
    }

    const importer = this.manifest.imports[localeFileKey];

    if (!importer) {
      this.statusRegister[localeFileKey] = LocaleFileStatus.error;
      return Promise.resolve();
    }

    this.statusRegister[localeFileKey] = LocaleFileStatus.loading;
    const promise = importer()
      .then((mod) => {
        delete this.promisesRegister[localeFileKey];
        this.messagesRegister[localeFileKey] = mod.default;
        this.statusRegister[localeFileKey] = LocaleFileStatus.loaded;
      })
      .catch((error) => {
        delete this.promisesRegister[localeFileKey];
        // eslint-disable-next-line no-console
        console.error(`Failed to load locale path ${localeFileKey}`, error);
        this.statusRegister[localeFileKey] = LocaleFileStatus.error;
      });

    this.promisesRegister[localeFileKey] = promise;
    return promise;
  }

  /** @type {import('./internal.d.ts').IntlManager_getMessages } */
  getMessages(localeFileKey) {
    return this.messagesRegister[localeFileKey];
  }

  /** @type {import('./internal.d.ts').IntlManager_getStatus } */
  getStatus(localeFileKey) {
    return this.statusRegister[localeFileKey] ?? LocaleFileStatus.notLoaded;
  }

  /** @type {import('./internal.d.ts').IntlManager_handleLocale } */
  handleLocale(locale) {
    /** @type {import('./internal.d.ts').InternalIntlManager } */
    const manager = this;

    if (isBrowser) {
      if (!_browserSingletonHandler) {
        _browserSingletonHandler = new LocaleHandler(manager, locale);
      }
      return _browserSingletonHandler;
    }

    return new LocaleHandler(manager, locale);
  }
}
