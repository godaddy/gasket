const fs = require('fs');
const path = require('path');
import localeApi, { selectLocaleManifestValue } from './LocaleApi';
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
 * Reads the locales.map file from the server. This is called from withLocaleRequired HOC
 * when it renders on server.
 * We will update this when we decide to configure where the locale data is kept.
 *
 * @param {string} localesDir - path to build directory containing locales
 * @returns {Promise} resolves with json data from locales.map file.
 */
export async function readLocaleManifestFile(localesDir) {
  const filePath = path.join(localesDir, 'locales-manifest.json');
  return await readFile(filePath);
}

/**
 * Reads a locales file from the server, based on the given module path and file name.
 * This is called from withLocaleRequired HOC when it renders on server.
 * We will update this when we decide to configure where the locale data is kept.
 *
 * @param {string} params - this contains module name and namespace.
 * @param {string} localesDir - path to build directory containing locales
 * @param {string} params.module - this contains module name and namespace.
 * @param {string} params.localeFile - this contains the file name including the hash key.
 * @returns {Promise} resolves with json data from locales file.
 */
export async function readLocaleFile(params, localesDir) {
  const { module, localeFile } = params;
  const filePath = path.join(localesDir, module, localeFile);
  return await readFile(filePath);
}

/**
 * This function loops through the module names provided to withLocaleRequired component
 * and reads the locale files for each of those identifiers and saves them in the Redux store.
 *
 * @param {object} store - Redux store from context
 * @param {array} identifiers - list of module names
 * @param {string} localesDir - path to build directory containing locales
 */
export async function loadLocaleFilesIntoStore(store, identifiers, localesDir) {
  await loadLocaleMapIntoStore(store, localesDir);
  const state = store.getState();
  const moduleParams = getParamsForIdentifiers(state, identifiers);

  for (let i = 0; i < moduleParams.length; i++) {
    const params = moduleParams[i];
    const fileData = await readLocaleFile(params, localesDir);
    await store.dispatch(
      localeApi.actionCreators.getMessages.success(params, fileData));
  }
}

/**
 * This function loads the locales.map file from server and into the Redux store.
 * It gets calls from withIntlProvider.
 *
 * @param {object} store - Redux store from context.
 * @param {string} localesDir - path to build directory containing locales
 */
export async function loadLocaleMapIntoStore(store, localesDir) {
  //
  // return early if already loaded
  //
  if (selectLocaleManifestValue(store.getState())) return;

  const manifest = await readLocaleManifestFile(localesDir);
  await store.dispatch(
    localeApi.actionCreators.getLocaleManifest.success({}, manifest));
}
