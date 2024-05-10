import { IncomingMessage, OutgoingMessage } from 'http';

/**
 * Locale settings and known locale file paths
 */
export interface LocaleManifest {
  /** Base URL where locale files are served */
  basePath?: string;
  /** Path to endpoint with JSON files */
  localesPath: LocalePathPart;
  /** Locale to fallback to when loading files */
  defaultLocale: Locale;
  /** Mapping of locales to share files */
  localesMap?: Record<Locale, Locale>;
  /** Available locale files to content hashes */
  paths: Record<LocalePath, string>;
  locales: Locale[];
  /** Default lookup path to locale files */
  defaultPath: string;
}

/**
 * Partial URL representing a directory containing locale .json files
 * or a URL template with a `:locale` path param to a .json file.
 * @example
 * "/locales"
 * @example
 * // as a template
 * "/locales/:locale/component.json"
 * @example
 * // other param formats
 * "/locales/$locale/component.json"
 * "/locales/{locale}/component.json"
 */
export type LocalePathPart = string;

/**
 * Callback which receives a context object for resolving a LocalePathPath
 */
export type LocalePathThunk = (context: {
  // Any server render
  req?: IncomingMessage;
  res?: OutgoingMessage;

  // Possible Next.js contexts
  // @see: https://nextjs.org/docs/api-reference/data-fetching/get-static-props#context-parameter
  // @see: https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#context-object
  // @see: https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#context-parameter
  [key: string]: any;
}) => LocalePathPart;

/**
 * Callback which receives a context object for resolving a LocalePathPath
 */
export type LocalePathPartOrThunk = LocalePathPart | LocalePathThunk;

/**
 * URL path to a locale .json file
 * @example
 * "/locales/en-US.json"
 * @example
 * // from a template
 * "/locales/en-US/component.json"
 */
export type LocalePath = string;
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
/**
 * State of loaded locale files
 */
export interface LocalesState {
  messages?: Record<Locale, Record<string, string>>;
  status?: Record<LocalePath, LocaleStatus>;
}

/**
 * Enum for local status values
 */
export enum LocaleStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Props for a Next.js page containing locale and initial state
 */
export interface LocalesProps extends LocalesState {
  locale: Locale;
}

export interface LocaleUtilsConfig {
  manifest: LocaleManifest;
  /** Locale file base path. Defaults to `manifest.basePath` */
  basePath?: string;
  debug?: Function;
}

/**
 * Utility class for loading locale files
 */
export function LocaleUtils(config: LocaleUtilsConfig) {
  /**
   * Fallback to the lang part of a locale or to defaultLocale.
   * Strategy is:
   *  <locale>
   *  <locale lang (if doesn't match default lang)>
   *  <default locale (if a locale)>
   *  <default lang>
   *  null
   *
   * Here's an example using da-DK/da with en-US as defaultLocale
   * da-DK ==> da ==> en-US ==> en ==> null
   */
  this.getFallbackLocale = (
    /** Current locale */
    locale?: Locale
  ) => Locale | Lang | null;

  /**
   * Format a localePath with provided locale. Ensures path starts with slash
   * and ends with .json file.
   */
  this.formatLocalePath = (
    /** Path containing locale files */
    localePathPart: LocalePathPart,
    locale: Locale
  ) => LocalePath;

  /**
   * Get a localePathPart from provided string or thunk callback results
   */
  this.resolveLocalePathPart = (
    /** Path containing locale files */
    localePathPart: LocalePathPartOrThunk,
    context?: string
  ) => LocalePath;

  /**
   * Get a formatted localePath considering language mappings and fallbacks
   */
  this.getLocalePath = (
    /** Path containing locale files */
    localePathPart: LocalePathPartOrThunk,
    locale: Locale
  ) => LocalePath;

  /**
   * Add base path from window.gasket.intl or manifest if set to the locale path
   */
  this.pathToUrl = (
    /** URL path to a locale file */
    localePath: LocalePath
  ) => string;

  /**
   * Load locale file(s) and return localesProps. Throws error if attempted to
   * use in browser.
   */
  this.serverLoadData = (
    /** Path(s) containing locale files */
    localePathPart: LocalePathPartOrThunk | LocalePathPartOrThunk[],
    /** Locale to load */
    locale: Locale,
    /** Disk path to locale files dir */
    localesDir: string,
    /** Context for resolving localePathThunk */
    context?: string
  ) => LocalesProps;
}

export function LocaleServerUtils(config: LocaleUtilsConfig) {
  /**
   * Load locale file(s) and return localesProps. Throws error if attempted to
   * use in browser.
   */
  this.serverLoadData = (
    /** Path(s) containing locale files */
    localePathPart: LocalePathPartOrThunk | LocalePathPartOrThunk[],
    /** Locale to load */
    locale: Locale,
    /** Disk path to locale files dir */
    localesDir: string,
    /** Context for resolving localePathThunk */
    context?: string
  ) => LocalesProps;
}
