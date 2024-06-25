const happyFeet = require('happy-feet');

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  return {
    getHappyFeet(happyConfig) {
      return happyFeet(gasket.config.happyFeet || happyConfig || {});
    }
  };
};
