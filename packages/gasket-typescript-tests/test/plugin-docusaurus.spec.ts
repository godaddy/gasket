import { GasketConfigFile } from '@gasket/engine';
import '@gasket/plugin-docusaurus';

describe('@gasket/plugin-docusaurus', () => {
  it('adds a docusaurus config section', () => {
    const config: GasketConfigFile = {
      docusaurus: {
        rootDir: 'docs',
        docsDir: 'docs',
        port: 3000,
        host: 'localhost'
      }
    };
  });
});
