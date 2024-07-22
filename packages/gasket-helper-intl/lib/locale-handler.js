import { LocaleFileStatus, LocaleFileStatusPriority } from './constants.js';

const reLocalePathParam = /(\/[$:{]locale}?\/)/;
const reStartEndSlashes = /^\/|\/$/;


/** @type {import('./types').safePaths} */
export function safePaths(localeFilePaths, defaultLocaleFilePath) {
  return localeFilePaths?.length ? localeFilePaths : [defaultLocaleFilePath];
}

/** @type {import('./types').lowestStatus} */
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
 * @type {import('./index').LocaleHandler}
 */
export class LocaleHandler {
  /** @type {import('./types').LocaleFileKey[] } */
  handledKeys = [];
  /** @type {import('./types').LocaleFileKey[] } */
  preloadKeys = [];
  /** @type {import('./types').MessagesRegister } */
  preloadRegister;
  handledDirty = true;
  preloadDirty = true;

  /** @type {import('./types').LocaleHandler_constructor } */
  constructor(manager, locale) {
    this.manager = manager;
    this.locale = locale;
    this.resolvedLocale = this.manager.resolveLocale(locale);
  }

  /** @type {import('./types').LocaleHandler_getLocaleFileKey} */
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

  /** @type {import('./types').LocaleHandler_load} */
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

  /** @type {import('./types').LocaleHandler_getStatus} */
  getStatus(...localeFilePaths) {
    const list = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    const statuses = list.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.handledKeys.includes(localeFileKey)) {
        return LocaleFileStatus.notHandled;
      }

      return this.manager.getStatus(localeFileKey);
    });

    return lowestStatus(statuses);
  }

  /** @type {import('./types').LocaleHandler_preload} */
  async preload(...localeFilePaths) {
    const list = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    list.map((localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.preloadKeys.includes(localeFileKey)) {
        this.preloadDirty = true;
        this.preloadKeys.push(localeFileKey);
      }
    });

    return this.load(...list);
  }

  /** @type {import('./types').LocaleHandler_getAllMessages} */
  getAllMessages() {
    if (this.handledDirty) {
      this.messages = this.handledKeys.reduce((acc, localeFileKey) => {
        return { ...acc, ...this.manager.getMessages(localeFileKey) };
      }, {});
      this.handledDirty = false;
    }
    return this.messages;
  }

  /** @type {import('./types').LocaleHandler_getPreloadRegister} */
  getPreloadRegister() {
    if (this.preloadDirty) {
      this.preloadRegister = this.preloadKeys.reduce((acc, localeFileKey) => {
        return { ...acc, [localeFileKey]: this.manager.getMessages(localeFileKey) };
      }, {});
      this.preloadDirty = false;
    }
    return this.preloadRegister;
  }
}
