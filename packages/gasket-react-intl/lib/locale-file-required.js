import { LocaleFileStatus } from '@gasket/intl';
import { ensureArray } from './utils.js';
import useLocaleFile from './use-locale-file.js';

/**
 * Component that loads a locale file before rendering children
 * @type {import('./index.d.ts').LocaleFileRequired}
 */
export default function LocaleFileRequired(props) {
  const {
    localeFilePath,
    loading = null,
    children
  } = props;
  const lowestStatus = useLocaleFile(...ensureArray(localeFilePath));

  if (
    lowestStatus !== LocaleFileStatus.loaded &&
    lowestStatus !== LocaleFileStatus.error
  ) return loading;

  return children;
}
