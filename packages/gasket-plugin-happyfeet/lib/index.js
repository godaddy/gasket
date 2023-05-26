const happyFeet = require('happy-feet');

module.exports = {
  name: require('../package').name,
  hooks: {
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
      return 'page ok';
    }
  }
};
