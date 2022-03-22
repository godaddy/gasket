/**
 * Locale settings and known locale file paths
 */
export interface LocaleManifest {
    /**
     * Base URL where locale files are served
     */
    basePath?: string
    /**
     * Path to endpoint with JSON files
     */
    localesPath: LocalePathPart
    /**
     * Locale to fallback to when loading files
     */
    defaultLocale: Locale
    /**
     * Mapping of locales to share files
     */
    localesMap?: Record<Locale, Locale>
    /**
     * Available locale files to content hashes
     */
    paths: Record<LocalePath, string>
}

/**
 * Partial URL representing a directory containing locale .json files
 * or a URL template with a `:locale` path param to a .json file.
 */
export type LocalePathPart = string;
/**
 * URL path to a locale .json file
 */
export type LocalePath = string;
/**
 * Language code only
 */
export type Lang = string;
/**
 * Language code with region
 */
export type Locale = Lang;
/**
 * State of loaded locale files
 */
export interface LocalesState {
    messages: Record<string, string>
    status: Record<LocalePath, LocaleStatus>
}

/**
 * Enum for local status values
 */
export type LocaleStatus = string;
export namespace LocaleStatus {
    const LOADING: string;
    const LOADED: string;
    const ERROR: string;
}

/**
 * Props for a Next.js page containing locale and initial state
 */
export interface LocalesProps extends LocalesState {
    locale: Locale
}

/**
 * @classdesc Utility class for loading locale files
 *
 * @param {Object} config - Configuration
 * @param {LocaleManifest} config.manifest - Locale file manifest
 * @param {string} [config.basePath] - Locale file base path. Defaults to `manifest.basePath`
 * @constructor
 */
export function LocaleUtils(config: {
    manifest: LocaleManifest;
    basePath?: string;
}): void;
export class LocaleUtils {
    /**
     * @classdesc Utility class for loading locale files
     *
     * @param {Object} config - Configuration
     * @param {LocaleManifest} config.manifest - Locale file manifest
     * @param {string} [config.basePath] - Locale file base path. Defaults to `manifest.basePath`
     * @constructor
     */
    constructor(config: {
        manifest: LocaleManifest;
        basePath?: string;
    });
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
     *
     * @param {Locale} locale - Current locale
     * @returns {Locale|Lang|null} language - fallback language to use.
     * @method
     */
    getFallbackLocale: (locale?: Locale) => Locale | Lang | null;
    /**
     * Format a localePath with provided locale. Ensures path starts with slash
     * and ends with .json file.
     *
     * @param {LocalePathPart} localePathPart - Path containing locale files
     * @param {Locale} locale - Locale
     * @returns {LocalePath} localePath
     * @method
     */
    formatLocalePath: (localePathPart: LocalePathPart, locale: Locale) => LocalePath;
    /**
     * Get a formatted localePath considering language mappings and fallbacks
     *
     * @param {LocalePathPart} localePathPart - Path containing locale files
     * @param {Locale} locale - Locale
     * @returns {LocalePath} localePath
     * @method
     */
    getLocalePath: (localePathPart: LocalePathPart, locale: Locale) => LocalePath;
    /**
     * Add base path from window.gasket.intl or manifest if set to the locale path
     *
     * @param {LocalePath} localePath - URL path to a locale file
     * @returns {string} url
     * @method
     */
    pathToUrl: (localePath: LocalePath) => string;
    /**
     * Load locale file(s) and return localesProps.
     * Throws error if attempted to use in browser.
     *
     * @param {LocalePathPart|LocalePathPart[]} localePathPart - Path(s) containing locale files
     * @param {Locale} locale - Locale to load
     * @param {string} localesDir - Disk path to locale files dir
     * @returns {LocalesProps} localesProps
     */
    serverLoadData: (localePathPart: any, locale: any, localesDir: any) => any;
}
