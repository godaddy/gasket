import { LocaleFileStatus, LocaleFileStatusPriority } from './constants.js';

const reLocalePathParam = /(\/[$:{]locale}?\/)/;
const reStartEndSlashes = /^\/|\/$/;


/** @type {import('./internal.d.ts').safePaths} */
export function safePaths(localeFilePaths, defaultLocaleFilePath) {
  return localeFilePaths?.length ? localeFilePaths : [defaultLocaleFilePath];
}

/** @type {import('./internal.d.ts').lowestStatus} */
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

  /**
   * This keeps track of all the locale keys that have been loaded
   * and includes both static and dynamic loads.
   * @type {import('./internal.d.ts').LocaleFileKey[] }
   */
  handledKeys = [];

  /**
   * This keeps track of all the messages that have been loaded statically
   * @type {import('./internal.d.ts').LocaleFileKey[] }
   */
  staticKeys = [];

  /**
   * All statically loaded localeFileKeys and their messages
   * @type {import('./internal.d.ts').MessagesRegister }
   */
  staticsRegister;

  /**
   * All loaded messages combined
   * @type {import('./internal.d.ts').LocaleMessages }
   */
  messages;

  handledDirty = true;
  staticsDirty = true;

  /** @type {import('./internal.d.ts').LocaleHandler_constructor } */
  constructor(manager, locale) {
    this.manager = manager;
    this.locale = locale;
    this.resolvedLocale = this.manager.resolveLocale(locale);
    this.init();
  }

  /** @type {import('./internal.d.ts').LocaleHandler_getLocaleFileKey} */
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

  /** @type {import('./internal.d.ts').LocaleHandler_load} */
  async load(...localeFilePaths) {
    const list = safePaths(localeFilePaths, this.manager.defaultLocaleFilePath);

    return Promise.allSettled(list.map(async (localeFilePath) => {
      const localeFileKey = this.getLocaleFileKey(localeFilePath);
      if (!this.handledKeys.includes(localeFileKey)) {
        await this.manager.load(localeFileKey);
        this.handledDirty = true;
        this.handledKeys.push(localeFileKey);
      }
    }));
  }

  /** @type {import('./internal.d.ts').LocaleHandler_getStatus} */
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

  /** @type {import('./internal.d.ts').LocaleHandler_init} */
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

  /** @type {import('./internal.d.ts').LocaleHandler_loadStatics} */
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

  /** @type {import('./internal.d.ts').LocaleHandler_getAllMessages} */
  getAllMessages() {
    if (this.handledDirty) {
      this.messages = this.handledKeys.reduce((acc, localeFileKey) => {
        return { ...acc, ...this.manager.getMessages(localeFileKey) };
      }, {});
      this.handledDirty = false;
    }
    return this.messages;
  }

  /** @type {import('./internal.d.ts').LocaleHandler_getStaticsRegister} */
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
