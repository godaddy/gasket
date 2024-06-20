/// <reference types="@gasket/plugin-https" />

const { name, version, description } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    healthcheck: async function healthcheck(gasket, HealthCheckError) {
      const happy = gasket.happyFeet;
      if (happy.state === happy.STATE.UNHAPPY) {
        // flag pod to be removed from LB
        throw new HealthCheckError(`Happy Feet entered an unhappy state`);
      }
    }
  }
};

module.exports = plugin;
