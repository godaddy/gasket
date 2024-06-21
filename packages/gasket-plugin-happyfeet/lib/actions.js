const happyFeet = require('happy-feet');

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  let happyInstance;
  return {
    getHappyFeet(happyConfig) {
      if (!happyInstance) {
        const config = gasket.config.happyFeet || happyConfig || {};
        happyInstance = happyFeet(config);
      }

      return happyInstance;
    }
  };
};
