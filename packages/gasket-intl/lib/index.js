import { IntlManager } from './intl-manager.js';
import { InternalIntlManager } from './internal-intl-manager.js';
import { LocaleFileStatus, LocaleFileStatusPriority } from './constants.js';
import { safePaths, lowestStatus } from './locale-handler.js';

/**
 * Creates an IntlManager instance
 * @type {import('./index.d.ts').makeIntlManager}
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
