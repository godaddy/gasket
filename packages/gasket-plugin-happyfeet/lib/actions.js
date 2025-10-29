import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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

export const actions = {
  getHappyFeet
};

export const testReset = () => {
  happy = null;
};
