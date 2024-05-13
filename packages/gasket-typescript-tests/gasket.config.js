/* eslint-disable spaced-comment */
//@ts-check

import PluginWebpack from '@gasket/plugin-webpack';

/** @type {import('@gasket/core').GasketConfigDefinition} */
const config = {
  plugins: [PluginWebpack],
  compression: 'garbage',
  http: 8080,
  intl: {
    // @ts-expect-error
    defaultLocale: 2
  }
};

export default config;
