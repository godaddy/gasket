import { useContext } from 'react';
import { GasketIntlContext } from './context';
import { ensureArray, needsToLoad } from './utils.js';

/**
 * React hook that dispatches locale file load and returns status
 * @type {import('.').useLocaleFile}
 */
export default function useLocaleFile(...localeFilePaths) {
  const paths = ensureArray(localeFilePaths);
  const { getStatus, load } = useContext(GasketIntlContext);
  const lowestStatus = getStatus(...paths);
  if (needsToLoad(lowestStatus)) load(...paths);
  return lowestStatus;
}
