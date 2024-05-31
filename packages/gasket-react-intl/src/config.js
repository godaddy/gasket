/* eslint-disable no-process-env */
import gasketData from '@gasket/data';
/**
 * @type {import('@gasket/helper-intl').LocaleManifest}
 */
const manifest = process.env.GASKET_INTL_MANIFEST_FILE
  ? require(process.env.GASKET_INTL_MANIFEST_FILE)
  : {};
const isBrowser = typeof window !== 'undefined';

/** @type {import('.').IntlGasketData} */
// @ts-ignore -- default to empty object
const clientData = (isBrowser && gasketData()?.intl) ?? {};

const {
  // these properties set in manifest, could also be configured on render
  basePath = manifest.basePath
} = clientData;

export { isBrowser, basePath, manifest, clientData };
