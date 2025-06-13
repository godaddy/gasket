/**
 * Public API for internationalization
 * @type {import('./index.d.ts').IntlManager}
 */
class IntlManager {
  /**
   * @param {import('./internal.d.ts').InternalIntlManager} manager - The internal IntlManager instance
   */
  constructor(manager) {
    this._manager = manager;
  }

  /**
   * Gets the list of supported locales
   * @type {import('./index.d.ts').IntlManager['locales']}
   */
  get locales() {
    return this._manager.locales;
  }

  /**
   * Gets the default locale file path
   * @type {import('./index.d.ts').IntlManager['defaultLocaleFilePath']}
   */
  get defaultLocaleFilePath() {
    return this._manager.defaultLocaleFilePath;
  }

  /**
   * Gets the static locale file paths
   * @type {import('./index.d.ts').IntlManager['staticLocaleFilePaths']}
   */
  get staticLocaleFilePaths() {
    return this._manager.staticLocaleFilePaths;
  }

  /**
   * Resolves a locale to a supported locale
   * @type {import('./index.d.ts').IntlManager['resolveLocale']}
   */
  resolveLocale(locale) {
    return this._manager.resolveLocale(locale);
  }

  /**
   * Gets a locale handler for a locale
   * @type {import('./index.d.ts').IntlManager['handleLocale']}
   */
  handleLocale(locale) {
    // Pass the internal manager to the LocaleHandler
    return this._manager.handleLocale(locale);
  }
}

export { IntlManager };
