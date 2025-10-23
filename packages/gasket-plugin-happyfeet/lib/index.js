/// <reference types="@gasket/plugin-https" />

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');
import { actions } from './actions.js';

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  actions,
  hooks: {
    healthcheck: async function healthcheck(gasket, HealthCheckError) {
      const happy = gasket.actions.getHappyFeet();
      if (happy && happy.state === happy.STATE.UNHAPPY) {
        // flag pod to be removed from LB
        throw new HealthCheckError(`Happy Feet entered an unhappy state`);
      }
    },
    metadata(gasket, meta) {
      return {
        ...meta,
        actions: [
          {
            name: 'getHappyFeet',
            description: 'Get the Happy Feet instance',
            link: 'README.md#getHappyFeet'
          }
        ]
      };
    }
  }
};

export default plugin;
