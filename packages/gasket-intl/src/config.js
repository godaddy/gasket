const manifest = require(process.env.GASKET_INTL_MANIFEST_FILE);
const isBrowser = typeof window !== 'undefined';
const clientData = isBrowser && window?.gasketData?.intl || {};

const {
  // these properties set in manifest, could also be configured on render
  basePath = manifest.basePath,
  defaultLocale = manifest.defaultLocale
} = clientData;


export {
  isBrowser,
  basePath,
  defaultLocale,
  manifest,
  clientData
};
