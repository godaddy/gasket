import type { GasketConfigDefinition } from '@gasket/core';
import '@gasket/plugin-analyze';

describe('@gasket/plugin-analyze', () => {
  it('adds bundleAnalyzerConfig to GasketConfig', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      bundleAnalyzerConfig: {
        browser: {
          // @ts-expect-error
          nonsense: 'value'
        }
      }
    };
  });
});
