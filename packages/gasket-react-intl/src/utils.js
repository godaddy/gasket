import { LocaleFileStatus } from '@gasket/helper-intl';

export function ensureArray(value) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

export function needsToLoad(status) {
  return [LocaleFileStatus.notHandled, LocaleFileStatus.notLoaded].includes(status);
}
