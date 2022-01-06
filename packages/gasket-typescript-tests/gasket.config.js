/* eslint-disable spaced-comment */
//@ts-check
///<reference types="@gasket/preset-nextjs"/>

/** @type {import('@gasket/engine').GasketConfigFile} */
const config = {
  plugins: {
    presets: ['@gasket/nextjs']
  },
  // @ts-expect-error
  compression: 'garbage',
  http: 8080,
  intl: {
    // @ts-expect-error
    defaultLocale: 2
  }
};

module.exports = config;
