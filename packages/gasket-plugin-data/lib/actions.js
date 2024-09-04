/// <reference types="@gasket/core" />

const deepClone = json => JSON.parse(JSON.stringify(json));

const baseDataMap = new WeakMap();
const adjustedDataMap = new WeakMap();
const reqMap = new WeakMap();

/** @type {import('@gasket/core').ActionHandler<'getGasketData'>} */
async function getGasketData(gasket) {
  const key = gasket.symbol;
  if (!adjustedDataMap.has(key)) {
    const baseData = baseDataMap.get(key) ?? {};
    const adjustedData = await gasket.execWaterfall('gasketData', deepClone(baseData));

    if (!adjustedData) {
      throw new Error(
        'No gasketData - likely a gasketData lifecycle hook did not properly return data.'
      );
    }

    adjustedDataMap.set(key, adjustedData);
    baseDataMap.delete(key);
  }

  return adjustedDataMap.get(key);
}

/** @type {import('@gasket/core').ActionHandler<'getPublicGasketData'>} */
async function getPublicGasketData(gasket, req) {
  if (!reqMap.has(req)) {
    const basePublicData = (await gasket.actions.getGasketData()).public ?? {};

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

module.exports = {
  baseDataMap,
  actions: {
    getGasketData,
    getPublicGasketData
  }
};
