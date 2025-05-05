import { LocaleFileStatus } from '@gasket/intl';

/** @type {import('./index.d.ts').ensureArray} */
export function ensureArray(value) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

/** @type {import('./index.d.ts').needsToLoad} */
export function needsToLoad(status) {
  return [LocaleFileStatus.notHandled, LocaleFileStatus.notLoaded].includes(status);
}
