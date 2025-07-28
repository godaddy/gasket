/* eslint-disable vitest/expect-expect, jest/expect-expect */
import type { Gasket, Hook, GasketActions } from '@gasket/core';
import type { PluginData, Metadata } from '@gasket/plugin-metadata';

describe('@gasket/plugin-metadata', () => {
  type SlimGasket = Omit<Gasket,
    | 'config' | 'logger'
    | 'exec' | 'execSync' | 'execWaterfall' | 'execWaterfallSync' | 'execApply' | 'execApplySync'
    | 'hook'
  >

  it('defines a metadata lifecycle', () => {
    const hook: Hook<'metadata'> = (gasket: Gasket, origData: PluginData) => ({
      ...origData,
      extra: 'information',
      lifecycles: [{
        name: 'some-data',
        description: 'Allows plugins to do something with data',
        method: 'exec',
        parent: 'start'
      }],
      modules: [
        { name: 'right-pad', extra: 'data', link: 'DOC.md' }
      ]
    });
  });

  it('adds getMetadata action to Gasket', async () => {
    const actions: Partial<GasketActions> = {
      getMetadata: async () => ({} as Metadata)
    };
  });
});
