import { Gasket, GasketConfigDefinition, Hook } from '@gasket/core';
import '@gasket/plugin-webpack';
import '@gasket/plugin-nextjs';

describe('@gasket/plugin-webpack', () => {
  it('adds a webpack section to the Gasket config', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }]
    };
  });

  it('adds a webpackConfig lifecycle', () => {
    const hook: Hook<'webpackConfig'> = (
      gasket,
      config,
      { isServer, webpack }
    ) => isServer
      ? config
      : {
        ...config,
        plugins: [
          ...(config.plugins ?? []),
          new webpack.DefinePlugin({
            MEANING_OF_LIFE: 42
          })
        ]
      };
  });
});
