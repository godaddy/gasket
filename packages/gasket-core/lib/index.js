import { Gasket } from './gasket.js';

// TODO: Add JSDoc types
/**
 *
 * @param gasketConfigDefinition
 */
function makeGasket(gasketConfigDefinition) {
  return new Gasket(gasketConfigDefinition);
}

export {
  Gasket,
  makeGasket
};
