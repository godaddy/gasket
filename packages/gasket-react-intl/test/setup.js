/* eslint-disable no-process-env */
const path = require('path');

process.env.GASKET_INTL_MANIFEST_FILE = path.resolve(__dirname, 'fixtures/mock-manifest.json');
process.env.GASKET_INTL_LOCALES_DIR = path.resolve(__dirname, 'fixtures/locales');

global.Intl = require('intl');

import Enzyme from 'enzyme';
// TODO: switch to official adapter once available:
//  https://github.com/enzymejs/enzyme/pull/2430
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });
