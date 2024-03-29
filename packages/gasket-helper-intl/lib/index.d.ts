import { IncomingMessage, OutgoingMessage } from 'http';

/**
 * Locale settings and known locale file paths
 */
export interface LocaleManifest {
  /**
   * Base URL where locale files are served
   */
  basePath?: string;
  /**
   * Path to endpoint with JSON files
   */
  localesPath: LocalePathPart;
  /**
   * Locale to fallback to when loading files
   */
  defaultLocale: Locale;
  /**
   * Mapping of locales to share files
   */
  localesMap?: Record<Locale, Locale>;
  /**
   * Available locale files to content hashes
   */
  paths: Record<LocalePath, string>;
}

/**
 * Partial URL representing a directory containing locale .json files or a URL
 * template with a `:locale` path param to a .json file.
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

  // Possible Next.js contexts @see:
  // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#context-parameter
  // @see:
  // https://nextjs.org/docs/api-reference/data-fetching/get-initial-props#context-object
  // @see:
  // https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props#context-parameter
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
  messages: Record<string, string>;
  status: Record<LocalePath, LocaleStatus>;
}

/**
 * Enum for local status values
 * @readonly
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
  basePath?: string;
}

export declare class LocaleUtils {
  constructor(config: LocaleUtilsConfig);

  getFallbackLocale(locale?: Locale): Locale | Lang | null;

  formatLocalePath(localePathPart: LocalePathPart, locale: Locale): LocalePath;

  getLocalePath(localePathPart: LocalePathPart, locale: Locale): LocalePath;

  pathToUrl(localePath: LocalePath): string;

  serverLoadData(
    localePathPart: LocalePathPartOrThunk | LocalePathPartOrThunk[],
    locale: Locale,
    localesDir: string,
    context?: Record<string, any>
  ): LocalesProps;
}
