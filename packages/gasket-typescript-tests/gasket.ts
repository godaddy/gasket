/* eslint-disable spaced-comment */
import type { GasketConfigDefinition } from '@gasket/core';

import PluginWebpack from '@gasket/plugin-webpack';
import PluginNextjs from '@gasket/plugin-nextjs';

const config: GasketConfigDefinition = {
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
