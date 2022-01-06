import { Gasket, GasketConfigFile, Hook } from "@gasket/engine";
import '@gasket/plugin-webpack';
import '@gasket/plugin-nextjs';

describe('@gasket/plugin-webpack', () => {
  it('adds a webpack section to the Gasket config', () => {
    const config: GasketConfigFile = {
      plugins: {
        add: ['@gasket/plugin-webpack']
      },
      webpack: {
        performance: {
          maxAssetSize: 20000
        }
      }
    };
  });

  it('adds a webpackConfig lifecycle', () => {
    const hook: Hook<'webpackConfig'> = (
      gasket,
      config,
      { isServer, webpack, webpackMerge }
    ) => isServer
      ? config
      : webpackMerge.merge(config, {
        plugins: [
          new webpack.DefinePlugin({
            MEANING_OF_LIFE: 42
          })
        ]
      });
  })
});
