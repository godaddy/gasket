/* eslint-disable no-use-before-define */
import { LocaleFilePath, LocaleFileKey, Locale, LocaleMessages, MessagesRegister, StatusRegister, PromisesRegister, LocaleManifest, LocaleFileStatusType, LocaleHandler } from './index.d.ts';

// Re-export types needed by JavaScript files
export { LocaleFilePath, LocaleFileKey, Locale, LocaleMessages, MessagesRegister, StatusRegister, PromisesRegister, LocaleManifest, LocaleFileStatusType, LocaleHandler };

// Export utility function types
export type safePaths = (paths: LocaleFilePath[], defaultPath: LocaleFilePath) => LocaleFilePath[];
export type lowestStatus = (statuses: LocaleFileStatusType[]) => LocaleFileStatusType;

/**
 * @internal
 */
export type IntlManager_constructor = (manifest: LocaleManifest) => void;

/**
 * On the server, this will prepare all locales files
 * so that they are ready for SSR
 *
 * In the browser, this will prepare all loaded messages
 * rendered to the document.
 *
 * This is called automatically by the constructor.
 * @internal
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
 * @internal
 */
export type IntlManager_resolveLocale = (locale: Locale) => Locale;

/**
 * @internal
 */
export type IntlManager_load = (localeFileKey: LocaleFileKey) => Promise<void>;

/**
 * @internal
 */
export type IntlManager_getMessages = (localeFileKey: LocaleFileKey) => LocaleMessages;

/**
 * @internal
 */
export type IntlManager_getStatus = (localeFileKey: LocaleFileKey) => LocaleFileStatusType;

/**
 * @internal
 */
export type IntlManager_handleLocale = (locale: Locale) => LocaleHandler;

/**
 * @internal
 */
export type LocaleHandler_constructor = (manager: InternalIntlManager, locale: Locale) => void;

/**
 * @internal
 */
export type LocaleHandler_init = () => void;

/**
 * @internal
 */
export type LocaleHandler_getLocaleFileKey = (localeFilePath: LocaleFilePath) => LocaleFileKey;

/**
 * @internal
 */
export type LocaleHandler_loadStatics = (...localeFilePaths: LocaleFilePath[]) => Promise<PromiseSettledResult<void>[]>;

/**
 * @internal
 */
export type LocaleHandler_load = (...localeFilePaths: LocaleFilePath[]) => Promise<PromiseSettledResult<void>[]>;

/**
 * @internal
 */
export type LocaleHandler_getStatus = (...localeFilePath: LocaleFilePath[]) => LocaleFileStatusType;

/**
 * @internal
 */
export type LocaleHandler_getAllMessages = () => LocaleMessages;

/**
 * @internal
 */
export type LocaleHandler_getStaticsRegister = () => MessagesRegister;

/**
 * Manages loading and caching of locale files.
 * Only deals with resolved localeFileKeys.
 * @internal
 */
export class InternalIntlManager {
  messagesRegister: MessagesRegister;
  statusRegister: StatusRegister;
  promisesRegister: PromisesRegister;
  manifest: LocaleManifest;
  managedLocales: Locale[];

  constructor(manifest: LocaleManifest);

  get locales(): Locale[];
  get defaultLocaleFilePath(): LocaleFilePath;
  get staticLocaleFilePaths(): LocaleFilePath[];

  init: IntlManager_init;
  load: IntlManager_load;
  getMessages: IntlManager_getMessages;
  getStatus: IntlManager_getStatus;

  resolveLocale: IntlManager_resolveLocale;
  handleLocale: IntlManager_handleLocale;
}
