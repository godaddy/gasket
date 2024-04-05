import type { GasketConfigDefinition } from '@gasket/engine';
import '@gasket/plugin-analyze';

describe('@gasket/plugin-analyze', () => {
  it('adds bundleAnalyzerConfig to GasketConfig', () => {
    const config: GasketConfigDefinition = {
      plugins: {
        add: ['@gasket/analyze']
      },

      bundleAnalyzerConfig: {
        browser: {
          // @ts-expect-error
          nonsense: 'value'
        }
      }
    };
  });
});
