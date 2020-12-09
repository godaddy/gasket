/**
 * @type {LocaleManifest}
 */
const manifest = require(process.env.GASKET_INTL_MANIFEST_FILE); // eslint-disable-line no-process-env
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
