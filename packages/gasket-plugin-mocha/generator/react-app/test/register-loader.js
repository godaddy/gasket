import { register } from 'module';
import { pathToFileURL } from 'url';

// Register the Babel loader
register('@gasket/plugin-mocha/node-loader-babel', pathToFileURL('./test'));

// Register the styles loader
register('@gasket/plugin-mocha/node-loader-styles', pathToFileURL('./test'));
