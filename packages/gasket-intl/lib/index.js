import { IntlManager } from './intl-manager.js';
import { LocaleFileStatus } from './constants.js';

/** @type {import('@gasket/intl').makeIntlManager } */
function makeIntlManager(manifest) {
  return new IntlManager(manifest);
}

export { makeIntlManager, LocaleFileStatus };
