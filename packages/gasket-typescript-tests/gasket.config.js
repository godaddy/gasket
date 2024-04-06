/* eslint-disable spaced-comment */
//@ts-check

import PluginWebpack from '@gasket/plugin-webpack';

/** @type {import('@gasket/engine').GasketConfigDefinition} */
const config = {
  plugins: [PluginWebpack],
  // @ts-expect-error
  compression: 'garbage',
  http: 8080,
  intl: {
    // @ts-expect-error
    defaultLocale: 2
  }
};

export default config;
