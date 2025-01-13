/** @type {import('@gasket/intl').LocaleFileStatus} */
export const LocaleFileStatus = {
  notHandled: 'notHandled',
  notLoaded: 'notLoaded',
  loading: 'loading',
  loaded: 'loaded',
  error: 'error'
};

/** @type {import('@gasket/intl').LocaleFileStatus[]} */
export const LocaleFileStatusPriority = [
  LocaleFileStatus.notHandled,
  LocaleFileStatus.notLoaded,
  LocaleFileStatus.loading,
  LocaleFileStatus.error,
  LocaleFileStatus.loaded
];

export const isBrowser = typeof window !== 'undefined';
