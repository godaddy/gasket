import type { GasketConfigFile } from '@gasket/engine'
import '@gasket/plugin-analyze';

describe('@gasket/plugin-analyze', () => {
  it('adds bundleAnalyzerConfig to GasketConfig', () => {
    const config: GasketConfigFile = {
      plugins: {
        add: ['@gasket/analyze']
      },

      bundleAnalyzerConfig: {
        browser: {
          // @ts-expect-error
          nonsense: 'value'
        }
      }
    }
  });
});
