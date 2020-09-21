import { loadLocaleFilesIntoStore, loadSettingsIntoStore } from './ServerUtils';

/**
 * Create a getServerSideProps that loads locale data for identifiers
 *
 * @param {Array|String} identifiers - single module name or array of module names
 * @returns {function({store}): Promise} function
 */
export function withIntlGetServerSideProps(identifiers) {
  const { nextRedux } = require(process.env.GASKET_MAKE_STORE_FILE);
  return nextRedux.getServerSideProps(async ctx => {
    const { store, req, params } = ctx;
    // eslint-disable-next-line prefer-const
    let { locale, assetPrefix } = req.gasketIntl;
    locale = params.locale || locale;
    await loadSettingsIntoStore(store, { locale, assetPrefix });
    await loadLocaleFilesIntoStore(store, identifiers, locale);
    return {};
  });
}

/**
 * Create a getStaticProps that loads locale data for identifiers
 *
 * @param {Array|String} identifiers - single module name or array of module names
 * @returns {function({store}): Promise} function
 */
export function withIntlGetStaticProps(identifiers) {
  const { nextRedux } = require(process.env.GASKET_MAKE_STORE_FILE);
  return nextRedux.getStaticProps(async ctx => {
    const { store, params: { locale } } = ctx;
    await loadSettingsIntoStore(store, { locale });
    await loadLocaleFilesIntoStore(store, identifiers, locale);
    return {};
  });
}
