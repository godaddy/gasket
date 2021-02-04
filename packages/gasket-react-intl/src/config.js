/* eslint-disable no-process-env */
/**
 * @type {LocaleManifest}
 */
const manifest = process.env.GASKET_INTL_MANIFEST_FILE ?
  require(process.env.GASKET_INTL_MANIFEST_FILE) :
  {};
const isBrowser = typeof window !== 'undefined';
const clientData = isBrowser && require('@gasket/data')?.intl || {};

const {
  // these properties set in manifest, could also be configured on render
  basePath = manifest.basePath
} = clientData;


export {
  isBrowser,
  basePath,
  manifest,
  clientData
};
