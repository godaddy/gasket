const manifest = require(process.env.GASKET_INTL_MANIFEST_FILE);
const isBrowser = typeof window !== 'undefined';
const clientData = isBrowser && window?.gasketData?.intl || {};

const {
  // properties set in manifest, but can be be configured on render
  basePath = manifest.basePath,
  defaultLocale = manifest.defaultLocale
  // properties that can be set on render
  // locale
  // paths
  // messages
  // status
} = clientData;


export {
  isBrowser,

  basePath,
  defaultLocale,

  manifest,
  clientData
};
