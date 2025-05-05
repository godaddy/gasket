import { LocaleFileStatus, LocaleFileStatusPriority } from './constants.js';

const reLocalePathParam = /(\/[$:{]locale}?\/)/;
const reStartEndSlashes = /^\/|\/$/;


/** @type {import('./index.d.ts').safePaths} */
export function safePaths(localeFilePaths, defaultLocaleFilePath) {
  return localeFilePaths?.length ? localeFilePaths : [defaultLocaleFilePath];
}

/** @type {import('./index.d.ts').lowestStatus} */
export function lowestStatus(statuses) {
  for (const status of LocaleFileStatusPriority) {
    if (statuses.includes(status)) {
      return status;
    }
  }
  return LocaleFileStatus.notLoaded;
}

/**
 * Utility class for loading locale files
 * @type {import('./index.d.ts').LocaleHandler}
 */
export class LocaleHandler {
  /** @type {import('./index.d.ts').LocaleFileKey[] } */
  handledKeys = [];
  /** @type {import('./index.d.ts').LocaleFileKey[] } */
  staticKeys = [];
  /** @type {import('./index.d.ts').MessagesRegister } */
  staticsRegister;
  handledDirty = true;
  staticsDirty = true;

  /** @type {import('./index.d.ts').LocaleHandler_constructor } */
  constructor(manager, locale) {
    this.manager = manager;
    this.locale = locale;
    this.resolvedLocale = this.manager.resolveLocale(locale);
    this.init();
  }

  /** @type {import('./index.d.ts').LocaleHandler_getLocaleFileKey} */
  getLocaleFileKey(localeFilePath) {
    const { resolvedLocale } = this;

    const targetFilePath = localeFilePath ?? this.manager.defaultLocaleFilePath;

    const cleanPart = targetFilePath
      .replace(reStartEndSlashes, '')
      .replace('.json', '');

    if (reLocalePathParam.test(cleanPart)) {
      return cleanPart.replace(reLocalePathParam, `/${resolvedLocale}/`);
    }

    return `${cleanPart}/${resolvedLocale}`;
  }

  /** @type {import('./index.d.ts').LocaleHandler_load} */
  async load(...localeFilePaths) {
    const list = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    return Promise.allSettled(list.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.handledKeys.includes(localeFileKey)) {
        this.handledDirty = true;
        this.handledKeys.push(localeFileKey);
      }
      return this.manager.load(localeFileKey);
    }));
  }

  /** @type {import('./index.d.ts').LocaleHandler_getStatus} */
  getStatus(...localeFilePaths) {
    const paths = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    const statuses = paths.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.handledKeys.includes(localeFileKey)) {
        return LocaleFileStatus.notHandled;
      }

      return this.manager.getStatus(localeFileKey);
    });

    return lowestStatus(statuses);
  }

  /** @type {import('./index.d.ts').LocaleHandler_init} */
  init() {
    const paths = this.manager.staticLocaleFilePaths;

    paths.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.staticKeys.includes(localeFileKey)) {
        this.staticsDirty = true;
        this.staticKeys.push(localeFileKey);
        this.handledDirty = true;
        this.handledKeys.push(localeFileKey);
      }
    });
  }

  /** @type {import('./index.d.ts').LocaleHandler_loadStatics} */
  async loadStatics(...localeFilePaths) {
    const paths = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    paths.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.staticKeys.includes(localeFileKey)) {
        this.staticsDirty = true;
        this.staticKeys.push(localeFileKey);
      }
    });

    return this.load(...paths);
  }

  /** @type {import('./index.d.ts').LocaleHandler_getAllMessages} */
  getAllMessages() {
    if (this.handledDirty) {
      this.messages = this.handledKeys.reduce((acc, localeFileKey) => {
        return { ...acc, ...this.manager.getMessages(localeFileKey) };
      }, {});
      this.handledDirty = false;
    }
    return this.messages;
  }

  /** @type {import('./index.d.ts').LocaleHandler_getStaticsRegister} */
  getStaticsRegister() {
    if (this.staticsDirty) {
      this.staticsRegister = this.staticKeys.reduce((acc, localeFileKey) => {
        return { ...acc, [localeFileKey]: this.manager.getMessages(localeFileKey) };
      }, {});
      this.staticsDirty = false;
    }
    return this.staticsRegister;
  }
}
