import { useContext } from 'react';
import fetch from '@gasket/fetch';
import { isBrowser } from './config';
import { LOADING, LOADED, ERROR, localeUtils } from './utils';
import { GasketIntlContext } from './context';

/**
 * React that fetches a locale file and returns loading status
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @returns {LocalePathStatus} status
 */
export function useGasketIntl(localePathPart) {
  const { locale, status = {}, dispatch } = useContext(GasketIntlContext);

  const localePath = localeUtils.getLocalePath(localePathPart, locale);

  const fileStatus = status[localePath];
  if (fileStatus) return fileStatus;

  // We cannot use dispatch from useReducer during SSR, so exit early.
  // If you want a locale file to be ready, preload it to gasketIntl data
  // or load with getStaticProps or getServerSideProps.
  if (!isBrowser) return LOADING;

  // Mutating status state to avoids an unnecessary render with using dispatch.
  status[localePath] = LOADING;

  const url = localeUtils.pathToUrl(localePath);

  // Upon fetching, we will dispatch file status and messages to kick off a render.
  fetch(url)
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`Error loading locale file (${ r.status }): ${ url }`)))
    .then(messages => {
      dispatch({
        type: LOADED,
        payload: {
          locale,
          messages,
          file: localePath
        }
      });
    })
    .catch(e => {
      console.error(e.message || e); // eslint-disable-line no-console
      dispatch({
        type: ERROR,
        payload: {
          file: localePath
        }
      });
    });

  return LOADING;
}
