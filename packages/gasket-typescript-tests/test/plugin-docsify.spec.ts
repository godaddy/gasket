import { GasketConfigFile } from "@gasket/engine";
import '@gasket/plugin-docsify';

describe('@gasket/plugin-docsify', () => {
  it('adds a docsify config section', () => {
    const config: GasketConfigFile = {
      docsify: {
        theme: 'fancy',
        port: 6234,
        config: {
          maxLevel: 4
        },
        stylesheets: ['./some.css', './file.css'],
        scripts: ['./jquery.js', './angular.js']
      }
    };
  });
});
