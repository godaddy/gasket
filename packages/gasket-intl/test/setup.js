/* eslint-disable no-process-env, no-console */
const path = require('path');
process.env.GASKET_INTL_MANIFEST_FILE = path.resolve(__dirname, 'fixtures/mock-manifest.json');
process.env.GASKET_INTL_LOCALES_DIR = path.resolve(__dirname, 'fixtures/locales');

console.log('process.env.GASKET_INTL_LOCALES_DIR', process.env.GASKET_INTL_LOCALES_DIR);
console.log('process.env.GASKET_INTL_MANIFEST_FILE', process.env.GASKET_INTL_MANIFEST_FILE);
