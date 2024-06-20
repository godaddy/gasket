const happyFeet = require('happy-feet');

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  return {
    getHappyFeet(happyConfig) {
      const config = gasket.config.happyFeet || happyConfig || {};
      return happyFeet(config);
    }
  };
};


// // @ts-ignore - TODO - replace attachment with GasketActions - do not attach to gasket instance
// preboot: async function preboot(gasket) {
//   const happyConfig = gasket.config.happyFeet || {};
//   gasket.happyFeet = happyFeet(happyConfig);
// },
