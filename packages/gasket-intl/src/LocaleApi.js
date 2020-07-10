import { setupApi, makeFetchAdapter } from 'reduxful';
import fetch from '@gasket/fetch';
import { isLoaded } from 'reduxful';

const apiName = 'LocaleApi';

export const selectAssetPrefix = (state) => {
  return (state.intl || state || {}).assetPrefix || '';
};

/**
 * REST API endpoint for loading locale files
 *
 * @type {Reduxful}
 */
const localeApi = setupApi(apiName,
  {
    getLocaleManifest: {
      url: '/locales-manifest.json'
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
 * Convenience selector to get locale manifest value from redux state
 *
 * @param {object} state - redux store state
 * @returns {object} locale manifest data in a json object
 */
export const selectLocaleManifestValue = (state) => {
  const manifest = localeApi.selectors.getLocaleManifest(state);
  if (isLoaded(manifest)) {
    return manifest.value;
  }
};

export {
  localeApi as default
};
