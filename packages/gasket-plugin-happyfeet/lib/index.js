/// <reference types="@gasket/plugin-https" />

const happyFeet = require('happy-feet');
const { name } = require('../package.json');

/** @type {import('@gasket/core').Plugin} */
const plugin = {
  name,
  hooks: {
    // @ts-ignore - TODO - replace attachment with GasketActions - do not attach to gasket instance
    preboot: async function preboot(gasket) {
      const happyConfig = gasket.config.happyFeet || {};
      gasket.happyFeet = happyFeet(happyConfig);
    },
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
