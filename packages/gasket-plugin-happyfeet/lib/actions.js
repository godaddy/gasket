const happyFeet = require('happy-feet');

/** @type {import('@gasket/core').HookHandler<'actions'>} */
module.exports = function actions(gasket) {
  let happy;
  return {
    getHappyFeet(happyConfig) {
      if (!happy) {
        const config = gasket.config.happyFeet || happyConfig || {};
        happy = happyFeet(config);
      }
      return happy;
    }
  };
};
