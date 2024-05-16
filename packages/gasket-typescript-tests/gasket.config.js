/* eslint-disable spaced-comment */
//@ts-check

import PluginWebpack from '@gasket/plugin-webpack';
import PluginNextjs from '@gasket/plugin-nextjs';

/** @type {import('@gasket/core').GasketConfigDefinition} */
const config = {
  plugins: [
    PluginWebpack,
    PluginNextjs
  ],
  compression: 'garbage',
  http: 8080,
  intl: {
    // @ts-expect-error
    defaultLocale: 2
  }
};

export default config;
