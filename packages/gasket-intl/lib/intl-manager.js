/**
 * Public API for internationalization
 */
class IntlManager {
  /**
   * @param {Object} manager - The internal IntlManager instance
   */
  constructor(manager) {
    this._manager = manager;
  }

  /**
   * Gets the list of supported locales
   * @returns {string[]} Array of supported locales
   */
  get locales() {
    return this._manager.locales;
  }

  /**
   * Gets the default locale file path
   * @returns {string} Default locale file path
   */
  get defaultLocaleFilePath() {
    return this._manager.defaultLocaleFilePath;
  }

  /**
   * Gets the static locale file paths
   * @returns {string[]} Array of static locale file paths
   */
  get staticLocaleFilePaths() {
    return this._manager.staticLocaleFilePaths;
  }

  /**
   * Resolves a locale to a supported locale
   * @param {string} locale - The locale to resolve
   * @returns {string} The resolved locale
   */
  resolveLocale(locale) {
    return this._manager.resolveLocale(locale);
  }

  /**
   * Gets a locale handler for a locale
   * @param {string} locale - The locale to handle
   * @returns {Object} A locale handler
   */
  handleLocale(locale) {
    // Pass the internal manager to the LocaleHandler
    return this._manager.handleLocale(locale);
  }
}

export { IntlManager };
