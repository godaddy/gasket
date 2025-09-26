/// <reference types="@gasket/core" />
/// <reference types="@gasket/plugin-redux" />

/**
 * @type {import('@gasket/core').HookHandler<'initReduxState'>}
 */
async function initReduxState(gasket, state, { req }) {
  /** @type {import('.').ReduxState} */
  const typedState = state || {};
  const publicGasketData = await gasket.actions.getPublicGasketData(req);
  return {
    ...typedState,
    gasketData: {
      ...(typedState.gasketData || {}),
      ...publicGasketData
    }
  };
}

module.exports = initReduxState;
