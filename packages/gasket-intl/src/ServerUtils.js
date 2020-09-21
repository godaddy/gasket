const fs = require('fs');
const path = require('path');
import localeApi, { selectLocale } from './LocaleApi';
import { getParamsForIdentifiers } from './Utils';

/**
 * Simple cache to avoid hitting file system for repeated requests.
 * @type {Map<String, JSON>}
 * @private
 */
const __fileCache = new Map();

/**
 * Function reads and parses a file from the server.
 *
 * @param {string} filePath - full path to the file.
 * @returns {Promise} - resolves with the json value from the file.
 */
export function readFile(filePath) {
  return new Promise((resolve) => {

    if (__fileCache.has(filePath)) {
      return resolve(__fileCache.get(filePath));
    }

    const doResolve = (data) => {
      if (data) __fileCache.set(filePath, data);
      resolve(data);
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        doResolve();
      } else {
        try {
          const fileData = JSON.parse(data);
          doResolve(fileData);
        } catch (e) {
          doResolve();
        }
      }
    });
  });
}

/**
 * Reads a locales file from the server, based on the given module path and file name.
 * This is called from withLocaleRequired HOC when it renders on server.
 * We will update this when we decide to configure where the locale data is kept.
 *
 * @param {string} params - this contains module name and namespace.
 * @param {string} params.module - this contains module name and namespace.
 * @param {string} params.localeFile - this contains the file name including the hash key.
 * @returns {Promise} resolves with json data from locales file.
 */
export async function readLocaleFile(params) {
  const { module, localeFile } = params;
  // eslint-disable-next-line no-process-env
  const filePath = path.join(process.env.GASKET_INTL_LOCALES_DIR, module, localeFile);
  return await readFile(filePath);
}

/**
 * This function loops through the module names provided to withLocaleRequired component
 * and reads the locale files for each of those identifiers and saves them in the Redux store.
 *
 * @param {object} store - Redux store from context
 * @param {array} identifiers - list of module names
 * @param {string|null} [locale] - Statically set locale name
 */
export async function loadLocaleFilesIntoStore(store, identifiers, locale = null) {
  if (!locale) {
    const state = store.getState();
    locale = selectLocale(state);
  }
  const moduleParams = getParamsForIdentifiers(locale, identifiers);

  // TODO: use Promise all here
  for (let i = 0; i < moduleParams.length; i++) {
    const params = moduleParams[i];
    const fileData = await readLocaleFile(params);
    await store.dispatch(localeApi.actionCreators.getMessages.success(params, fileData));
  }
}

/**
 * This function loads the locales.map file from server and into the Redux store.
 * It gets calls from withIntlProvider.
 *
 * @param {object} store - Redux store from context
 * @param {object} settings - settings to preload into store
 */
export async function loadSettingsIntoStore(store, settings) {
  await store.dispatch(
    localeApi.actionCreators.getSettings.success({}, settings));
}
