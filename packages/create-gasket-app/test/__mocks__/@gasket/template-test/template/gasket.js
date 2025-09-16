import { makeGasket } from '@gasket/core';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';

export default makeGasket({
  plugins: [
    pluginLogger,
    pluginNextjs
  ]
});

