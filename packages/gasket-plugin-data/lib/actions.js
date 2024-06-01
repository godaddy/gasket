/// <reference types="@gasket/core" />

const deepClone = json => JSON.parse(JSON.stringify(json));

let _gasketData;
const reqMap = new WeakMap();

/**
 * type {import('@gasket/core').HookHandler<'actions'>}
 */
function actions(gasket) {
  return {
    async getGasketData() {
      if (!_gasketData) {
        _gasketData = await gasket.execWaterfall('gasketData', deepClone(gasket.config.data ?? {}));

        if (!_gasketData) {
          throw new Error(
            'No gasketData - likely a gasketData lifecycle hook did not properly return data.'
          );
        }
      }
      return _gasketData;
    },
    async getPublicGasketData(req) {
      if (!reqMap.has(req)) {
        const basePublicData = (await gasket.actions.getGasketData()).public;

        const userPublicData = await gasket.execWaterfall(
          'publicGasketData',
          deepClone(basePublicData),
          { req }
        );

        if (!userPublicData) {
          throw new Error(
            'No public gasketData - likely a publicGasketData lifecycle hook did not properly return data.'
          );
        }

        reqMap.set(req, userPublicData);
      }

      return reqMap.get(req);
    }
  };
}

module.exports = actions;
