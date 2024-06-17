/// <reference types="@gasket/plugin-express" />
/// <reference types="@gasket/plugin-logger" />

const path = require('path');
const merge = require('lodash.merge');
const { LocaleUtils } = require('@gasket/helper-intl');
const { getIntlConfig } = require('./configure');

const debug = require('debug')('gasket:plugin:intl:middleware');

/** @type {import('@gasket/core').HookHandler<'middleware'>} */
function middlewareHook(gasket) {
  const {
    basePath,
    localesMap,
    localesDir,
    manifestFilename,
    preloadLocales
  } = getIntlConfig(gasket);

  const manifest = require(path.join(localesDir, manifestFilename));
  const localesParentDir = path.dirname(localesDir);
  const localeUtils = new LocaleUtils({
    manifest,
    basePath,
    debug: require('debug')('gasket:helper:intl')
  });

  if (preloadLocales) {
    debug(`Preloading locale files from ${localesParentDir}`);
    Object.keys(manifest.paths).forEach((localePath) => {
      debug(`Preloading locale file ${localePath}`);
      require(path.join(localesParentDir, localePath));
    });
  }

  return async function intlMiddleware(req, res, next) {
    // Allow plugins to determine locale to use
    const pluginLocale = await gasket.actions.getIntlLocale(req);
    debug(`Locale after plugin updates: ${pluginLocale}`);

    // Once we have a locale, see if there has been any remapping for it
    const locale = (localesMap && localesMap[pluginLocale]) || pluginLocale;
    debug(`Locale after remapping: ${locale}`);

    /**
     * Get the Intl GasketData from res.locals
     * @returns {import('./index').GasketDataIntl} intlData - Intl gasketData
     */
    function getIntlData() {
      const { gasketData = {} } = res.locals;
      return gasketData.intl || {};
    }

    /**
     * The gasketData object allows certain config data to be available for
     * rendering allowing access in the browser.
     * @param {import('./index').GasketDataIntl} intlData - data to merge to gasketData
     */
    function mergeGasketData(intlData) {
      const { gasketData = {} } = res.locals;
      const intl = merge({}, getIntlData(), intlData);
      res.locals.gasketData = { ...gasketData, intl };
    }

    mergeGasketData({
      locale,
      ...((basePath && { basePath }) || {})
    });

    /**
     * Load locale data and makes available from gasketData
     * @type {import('./internal').withLocaleRequired}
     */
    req.withLocaleRequired = function withLocaleRequired(
      localePathPart = manifest.defaultPath
    ) {
      const localesProps = localeUtils.serverLoadData(
        localePathPart,
        locale,
        localesParentDir
      );
      mergeGasketData(localesProps);
      return localesProps;
    };

    /**
     * Select a message for a loaded locale. Fall back to provided default if provided, or
     * message id if a loaded message is not found.
     * @param {string} id - Key of translated message
     * @param {string} [defaultMessage] - Fallback message if no id found or loaded
     * @returns {string} message
     */
    req.selectLocaleMessage = function selectLocaleMessage(id, defaultMessage) {
      const localeProps = getIntlData();
      return gasket.actions.getIntlMessage(localeProps, id, defaultMessage);
    };

    res.locals.localesDir = localesDir;

    next();
  };
}

module.exports = {
  timing: {
    before: ['@gasket/plugin-elastic-apm']
  },
  handler: middlewareHook
};
