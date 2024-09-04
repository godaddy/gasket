const happyFeet = require('happy-feet');

let happy;

/** @type {import('@gasket/core').ActionHandler<'getHappyFeet'>} */
function getHappyFeet(gasket, happyConfig) {
  if (!happy) {
    const config = gasket.config.happyFeet || happyConfig || {};
    happy = happyFeet(config);
  }
  return happy;
}

module.exports = {
  actions: {
    getHappyFeet
  },
  testReset: () => {
    happy = null;
  }
};
