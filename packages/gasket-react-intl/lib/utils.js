import { LocaleFileStatus } from '@gasket/intl';

/** @type {import('./types').ensureArray} */
export function ensureArray(value) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

/** @type {import('./types').needsToLoad} */
export function needsToLoad(status) {
  return [LocaleFileStatus.notHandled, LocaleFileStatus.notLoaded].includes(status);
}
