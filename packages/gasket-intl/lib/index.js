import { IntlManager } from './intl-manager.js';
import { InternalIntlManager } from './internal-intl-manager.js';
import { LocaleFileStatus, LocaleFileStatusPriority } from './constants.js';
import { safePaths, lowestStatus } from './locale-handler.js';

/**
 * Creates an IntlManager instance
 * @param {Object} manifest - The locale manifest
 * @returns {IntlManager} An IntlManager instance
 */
function makeIntlManager(manifest) {
  const manager = new InternalIntlManager(manifest);
  return new IntlManager(manager);
}

export {
  makeIntlManager,
  LocaleFileStatus,
  LocaleFileStatusPriority,
  safePaths,
  lowestStatus
};
