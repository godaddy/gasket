import type { Gasket, Hook } from "@gasket/engine";
import type { PluginData } from '@gasket/plugin-metadata';

describe('@gasket/plugin-metadata', () => {
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
        'left-pad',
        { name: 'right-pad', extra: 'data', link: 'DOC.md' }
      ]
    });
  });
});
