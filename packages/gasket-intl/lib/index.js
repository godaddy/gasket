import { IntlManager } from './intl-manager.js';
import { LocaleFileStatus } from './constants.js';

/** @type {import('./types').makeIntlManager } */
function makeIntlManager(manifest) {
  return new IntlManager(manifest);
}

export {
  makeIntlManager,
  LocaleFileStatus
};
