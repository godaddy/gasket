import type { Gasket, Hook } from '@gasket/engine';
import type { PluginData } from '@gasket/plugin-metadata';
import '@gasket/plugin-metadata';

describe('@gasket/plugin-metadata', () => {
  type SlimGasket = Omit<Gasket,
    |'config'|'logger'
    |'exec'|'execSync'|'execWaterfall'|'execWaterfallSync'|'execApply'|'execApplySync'
    |'hook'
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
        'left-pad',
        { name: 'right-pad', extra: 'data', link: 'DOC.md' }
      ]
    });
  });

  it('adds a metadata property to Gasket', () => {
    const gasket1: SlimGasket = {
      command: { id: 'docs' },
      metadata: {
        app: {
          name: 'example',
          module: '/path/to/app',
          path: '/path/to/app',
          package: {
            name: 'example'
          }
        },
        plugins: [
          {
            module: {},
            name: '@mock/gasket-plugin-x',
            configurations: [
              {
                name: 'configX',
                description: 'Configures the X plugin',
                type: 'object',
                link: 'https://some.docs.url/'
              }
            ]
          }
        ],
        presets: [],
        modules: []
      }
    };

    const gasket2: SlimGasket = {
      command: { id: 'docs' },
      metadata: {
        app: {
          name: 'example',
          module: '/path/to/app',
          path: '/path/to/app',
          package: {
            name: 'example'
          }
        },
        plugins: [{
          name: 'plugin-example',
          module: '/path/to/plugin-example'
        }],
        presets: [{
          name: 'preset-example',
          module: '/path/to/preset-example',
          plugins: [{
            name: 'plugin-example-deep',
            module: '/path/to/plugin-example-deep'
          }]
        }],
        modules: [{
          name: 'module-example',
          module: '/path/to/module-example'
        }]
      }
    };
  });
});
