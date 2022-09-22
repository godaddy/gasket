const path = require('path');
const merge = require('lodash.merge');
const { LocaleUtils, LocaleStatus } = require('./index');

/**
 * Server variant to load locale files from disk path
 * @extends { LocaleUtils }
 * @constructor
 */
function LocaleServerUtils() {
  LocaleUtils.apply(this, arguments);

  this.serverLoadData = (localePathPart, locale, localesDir, context = {}) => {
    if (Array.isArray(localePathPart)) {
      const localesProps = localePathPart.map(p => this.serverLoadData(p, locale, localesDir, context));
      return merge(...localesProps);
    }

    const localeFile = this.getLocalePath(localePathPart, locale, context);
    const diskPath = path.join(localesDir, localeFile);
    let messages;
    let status;

    try {
      messages = require(diskPath);
      status = LocaleStatus.LOADED;
    } catch (e) {
      console.error(e.message); // eslint-disable-line no-console
      messages = {};
      status = LocaleStatus.ERROR;
    }

    return {
      locale,
      messages: {
        [locale]: {
          ...messages
        }
      },
      status: {
        [localeFile]: status
      }
    };
  };
}

module.exports = {
  LocaleUtils: LocaleServerUtils,
  LocaleStatus
};
