/// <reference types="@gasket/plugin-redux" />

/**
 * @typedef {import('@gasket/core').HookHandler<'initReduxState'>}
 */
async function initReduxState(gasket, state, { req }) {
  const publicGasketData = await gasket.actions.getPublicGasketData(req);
  return {
    ...state,
    gasketData: {
      ...state.gasketData,
      ...publicGasketData
    }
  };
}

module.exports = initReduxState;
