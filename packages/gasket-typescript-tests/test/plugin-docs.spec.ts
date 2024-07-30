import type { GasketConfigDefinition, Hook } from '@gasket/core';
import '@gasket/plugin-docs';

describe('@gasket/plugin-docs', () => {
  it('defines the config for the plugin', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', version: '', description: '', hooks: {} }],
      docs: {
        outputDir: './out/docs'
      }
    };
  });

  it('validates config values', () => {
    const config: GasketConfigDefinition = {
      docs: {
        // @ts-expect-error
        outputDir: 3
      }
    };
  });

  it('declares a docsSetup lifecycle', () => {
    const hook: Hook<'docsSetup'> = (gasket, { defaults }) => {
      return defaults;
    };
  });

  it('declares a docsView lifecycle', () => {
    const hook: Hook<'docsView'> = (gasket, { docsRoot }) => {
      return;
    };
  });

  it('declares a docsGenerate lifecycle', () => {
    const hook: Hook<'docsGenerate'> = (gasket, config) => {
      return {
        name: 'FAQ',
        description: 'Frequently Asked Questions',
        link: '/FAQ.md',
        targetRoot: config.docsRoot,
        from: '@some/gasket-plugin-example'
      };
    };
  });
});
