/// <reference types="@gasket/plugin-data" />

/** @type {import('@gasket/core').HookHandler<'publicGasketData'>} */
module.exports = async function publicGasketDataHook(gasket, publicGasketData, { req }) {
  const locale = await gasket.actions.getIntlLocale(req);

  publicGasketData.intl ??= {};
  publicGasketData.intl.locale = locale;

  return publicGasketData;
};
