import { GasketConfigDefinition } from '@gasket/engine';
import '@gasket/plugin-docusaurus';

describe('@gasket/plugin-docusaurus', () => {
  it('adds a docusaurus config section', () => {
    const config: GasketConfigDefinition = {
      plugins: [{ name: 'example-plugin', hooks: {} }],
      docusaurus: {
        rootDir: 'docs',
        docsDir: 'docs',
        port: 3000,
        host: 'localhost'
      }
    };
  });
});
