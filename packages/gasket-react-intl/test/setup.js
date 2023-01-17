/* eslint-disable no-process-env */
const path = require('path');

process.env.GASKET_INTL_MANIFEST_FILE = path.resolve(__dirname, 'fixtures/mock-manifest.json');
process.env.GASKET_INTL_LOCALES_DIR = path.resolve(__dirname, 'fixtures/locales');

global.Intl = require('intl');
