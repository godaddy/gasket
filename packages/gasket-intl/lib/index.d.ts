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

export type LocaleMessages = Record<string, string | LocaleMessages>;
export type MessagesRegister = Record<LocaleFileKey, LocaleMessages>;
export type StatusRegister = Record<LocaleFileKey, LocaleFileStatusType>;
export type PromisesRegister = Record<LocaleFileKey, Promise<any>>;

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
  defaultLocaleFilePath?: LocaleFilePath;
  /** Array of paths to locale files for static/SSR rendering */
  staticLocaleFilePaths?: LocaleFilePath[];
}

/**
 * Locale settings with the generated file import map
 */
export interface LocaleManifest extends LocaleManifestConfig {
  imports: Record<LocaleFileKey, () => Promise<any>>;
}

/**
 * Enum for local status values
 */
export const LocaleFileStatus: {
  readonly notHandled: 'notHandled',
  readonly notLoaded: 'notLoaded',
  readonly loading: 'loading',
  readonly loaded: 'loaded',
  readonly error: 'error'
};

export type LocaleFileStatusType = typeof LocaleFileStatus[keyof typeof LocaleFileStatus];

/**
 * Array of LocaleFileStatus values in priority order
 */
export const LocaleFileStatusPriority: LocaleFileStatusType[];

/**
 * Returns the lowest status from an array of statuses based on priority
 */
export function lowestStatus(statuses: LocaleFileStatusType[]): LocaleFileStatusType;

/**
 * Ensures there's at least one path to use
 */
export function safePaths(paths: LocaleFilePath[], defaultPath: LocaleFilePath): LocaleFilePath[];

/**
 * Manages resolving and loading of locale files for a locale.
 * Only deals with unresolved localeFilePaths.
 */
export class LocaleHandler {
  /**
   * Loads locale files
   */
  load(...localeFilePaths: LocaleFilePath[]): Promise<PromiseSettledResult<void>[]>;

  /**
   * Loads static locale files for SSR
   */
  loadStatics(...localeFilePaths: LocaleFilePath[]): Promise<PromiseSettledResult<void>[]>;

  /**
   * Gets the loading status for locale file paths
   */
  getStatus(...localeFilePath: LocaleFilePath[]): LocaleFileStatusType;

  /**
   * Gets all loaded messages for the locale
   */
  getAllMessages(): LocaleMessages;

  /**
   * Gets the registry of static messages for SSR
   */
  getStaticsRegister(): MessagesRegister;
}

/**
 * Public API for internationalization
 */
export class IntlManager {
  /**
   * Gets the list of supported locales
   */
  get locales(): Locale[];

  /**
   * Gets the default locale file path
   */
  get defaultLocaleFilePath(): LocaleFilePath;

  /**
   * Gets the static locale file paths
   */
  get staticLocaleFilePaths(): LocaleFilePath[];

  /**
   * Resolves a locale to a supported locale
   */
  resolveLocale(locale: Locale): Locale;

  /**
   * Gets a locale handler for a locale
   */
  handleLocale(locale: Locale): LocaleHandler;
}

/**
 * Creates an IntlManager instance
 */
export function makeIntlManager(manifest: LocaleManifest): IntlManager;
