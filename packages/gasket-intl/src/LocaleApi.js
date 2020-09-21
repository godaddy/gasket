import { setupApi, makeFetchAdapter } from 'reduxful';
import fetch from '@gasket/fetch';
import { isLoaded } from 'reduxful';
import { isServer } from './Utils';

const manifest = require(process.env.GASKET_INTL_MANIFEST_FILE);
const apiName = 'LocaleApi';

/**
 * REST API endpoint for loading locale files
 *
 * @type {Reduxful}
 */
const localeApi = setupApi(apiName,
  {
    getSettings: {
      url: '/locales-settings.json'
    },
    getMessages: {
      url: (getState) => {
        const assetPrefix = selectAssetPrefix(getState());
        return `${assetPrefix}/_locales/:module/:localeFile`;
      }
    }
  },
  { requestAdapter: makeFetchAdapter(fetch) }
);

const selectMessageResources = state => {
  const store = state.LocaleApi || {};
  return Object.keys(store)
    .filter(k => k.indexOf('getMessages__') === 0 && store[k].isLoaded)
    .map(k => store[k]);
};

/**
 * Redux selector to check all the getMessages api calls and combine the messages in one json object
 *
 * @param {object} state - redux store state
 * @returns {object} all locale data in a json object
 */
export const selectAllMessages = state => {
  return selectMessageResources(state).reduce((acc, res) => ({ ...acc, ...res.value }), {});
};

/**
 * Selects message by key from all loaded getMessages resources
 *
 * @param {object} state - redux store state
 * @param {string} id - message name or key
 * @param {string} [defaultMessage] - optional default message if no key found
 * @returns {string} message
 */
export const selectMessage = (state, id, defaultMessage) => {
  return selectMessageResources(state).reduce((acc, res) => res.value[id] || acc, defaultMessage || id);
};

/**
 * Select the locale from redux state
 *
 * @param {object} state - redux state
 * @param {boolean} browserFallback - If no locale setting in Redux use navigator.languages in browser
 * @returns {string} locale
 */
export function selectLocale(state, browserFallback) {
  const settings = localeApi.selectors.getSettings(state);
  let locale;
  if (isLoaded(settings)) {
    locale = settings.value.locale;
  }

  return locale || (browserFallback && !isServer && navigator.languages[0]) || null;
}

/**
 * Select the locale from redux state
 *
 * @param {object} state - redux state
 * @returns {string} locale
 */
export function selectAssetPrefix(state) {
  const settings = localeApi.selectors.getSettings(state);
  if (isLoaded(settings)) {
    return settings.value.assetPrefix || '';
  }

  return '';
}

export {
  localeApi as default
};
