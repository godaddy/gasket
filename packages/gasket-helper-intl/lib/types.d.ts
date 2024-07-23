/**
 * Partial URL representing a directory containing locale .json files
 * or a URL template with a `:locale` path param to a file.
 * @example
 * "locales"
 * @example
 * // as a template
 * "locales/:locale/component"
 * @example
 * // other param formats
 * "locales/$locale/component"
 * "locales/{locale}/component"
 */
export type LocaleFilePath = string;

/**
 * Path key to a locale .json import
 * @example
 * "locales/en-US"
 * @example
 * // from a template
 * "locales/en-US/component"
 */
export type LocaleFileKey = string;

/**
 * Language code only
 * @example
 * "en"
 */
export type Lang = string;

/**
 * Language code with region
 * @example
 * "en-US"
 */
export type Locale = Lang;

export type LocaleMessages = Record<string, any>
export type MessagesRegister = Record<LocaleFileKey, LocaleMessages>
export type StatusRegister = Record<LocaleFileKey, LocaleFileStatus>
export type PromiseRegister = Record<LocaleFileKey, Promise>

/**
 * Locale settings
 */
export interface LocaleManifestConfig {
  /** Locale to fallback to when loading files */
  defaultLocale: Locale;
  /** Array of supported locales */
  locales: Locale[];
  /** Mapping of locales to supported locales */
  localesMap?: Record<Locale, Locale>;
  /** Default lookup path to locale files */
  defaultLocaleFilePath: LocaleFilePath;
  /** Array of paths to locale files for static/ssr rendering */
  staticLocaleFilePaths?: LocaleFilePath[];
}

/**
 * Locale settings with the generated file import map
 */
export interface LocaleManifest extends LocaleManifestConfig {
  imports: Record<LocaleFileKey, () => Promise>
}

/**
 * Enum for local status values
 */
const LocaleFileStatus = {
  notHandled = 'notHandled',
  notLoaded = 'notLoaded',
  loading = 'loading',
  loaded = 'loaded',
  error = 'error'
} as const;

// export type LocaleFileStatus = typeof localeFileStatus[keyof typeof localeFileStatus];

export function lowestStatus(statuses: LocaleFileStatus[]): LocaleFileStatus;

export function safePaths(paths: LocaleFilePath[], defaultPath: LocaleFilePath): LocaleFilePath[];

//
// -- CLASS METHODS --
//

export type IntlManager_constructor = (manifest: LocaleManifest) => void;

/**
 * On the server, this will prepare all locales files
 * so that they are ready for SSR
 *
 * In the browser, this will prepare all loaded messages
 * rendered to the document.
 *
 * This is called automatically by the constructor.
 * @private
 */
export type IntlManager_init = () => void;

/**
 * Fallback to the lang part of a locale or to defaultLocale.
 * Strategy is:
 *  <locale>
 *  <lang>
 *  <default locale>
 *
 * Here's an example using da-DK/da with en-US as defaultLocale
 * da-DK ==> da ==> en-US
 */
export type IntlManager_resolveLocale = (locale: Locale) => Locale;
export type IntlManager_load = (localeFileKey: LocaleFileKey) => Promise<void>;
export type IntlManager_getMessages = (localeFileKey: LocaleFileKey) => LocaleMessages;
export type IntlManager_getStatus = (localeFileKey: LocaleFileKey) => LocaleFileStatus;
export type IntlManager_handleLocale = (locale: Locale) => LocaleHandler;

export type LocaleHandler_constructor = (manager: IntlManager, locale: Locale) => void;
export type LocaleHandler_getLocaleFileKey = (localeFilePath: LocaleFilePath) => LocaleFileKey;
export type LocaleHandler_loadStatics = (...localeFilePaths: LocaleFilePath[]) => Promise;
export type LocaleHandler_load = (...localeFilePaths: LocaleFilePath[]) => Promise;
export type LocaleHandler_getStatus = (...localeFilePath: LocaleFilePath[]) => LocaStatus;
export type LocaleHandler_getAllMessages = () => LocaleMessages;
export type LocaleHandler_getStaticsRegister = () => MessagesRegister;

//
// -- CLASSES --
//

/**
 * Manages loading and caching of locale files
 * Only deals with resolved localeFileKeys
 */
export class IntlManager {
  private messagesRegister: MessagesRegister
  private statusRegister: StatusRegister
  private promisesRegister: PromiseRegister

  constructor(manifest: LocaleManifest)

  get defaultLocaleFilePath(): LocaleFilePath
  get staticLocaleFilePaths(): LocaleFilePath[]

  private init: IntlManager_init
  resolveLocale: IntlManager_resolveLocale
  load: IntlManager_load
  getMessages: IntlManager_getMessages
  getStatus: IntlManager_getStatus

  handleLocale: IntlManager_handleLocale
}

/**
 * Manages resolving and loading of locale files for a locale
 * Only deals with unresolved localeFilePaths
 */
export class LocaleHandler {
  private handledKeys: LocaleFileKey[]
  private loadKeys: LocaleFileKey[]
  private handledDirty: boolean
  private loadDirty: boolean
  private messages: Messages
  private staticsRegister: MessagesRegister

  constructor(manager: IntlManager, locale: Locale)

  private getLocaleFileKey: LocaleHandler_getLocaleFileKey
  loadStatics: LocaleHandler_loadStatics
  load: LocaleHandler_load
  getStatus: LocaleHandler_getStatus
  getAllMessages: LocaleHandler_getAllMessages
  getStaticsRegister: LocaleHandler_getStaticsRegister
}

export function makeIntlManager(manifest: LocaleManifest): IntlManager
