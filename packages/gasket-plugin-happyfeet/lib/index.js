/// <reference types="@gasket/plugin-https" />

const { name, version, description } = require('../package.json');
const actions = require('./actions');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  version,
  description,
  hooks: {
    actions,
    healthcheck: async function healthcheck(gasket, HealthCheckError) {
      console.log(gasket);
      const happy = gasket.actions.getHappyFeet();
      if (happy && happy.state === happy.STATE.UNHAPPY) {
        // flag pod to be removed from LB
        throw new HealthCheckError(`Happy Feet entered an unhappy state`);
      }
    }
  }
};

module.exports = plugin;
