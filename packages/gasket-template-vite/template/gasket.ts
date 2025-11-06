import type { GasketConfigDefinition } from '@gasket/core';
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';
import pluginLogger from '@gasket/plugin-logger';
import pluginVite from '@gasket/plugin-vite';

export default makeGasket({
  plugins: [
    pluginHttps,
    pluginExpress,
    pluginLogger,
    pluginVite
  ],
  
  http: 3000
} as GasketConfigDefinition);

