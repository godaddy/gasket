import { register } from 'module';
import { pathToFileURL } from 'url';

register('@gasket/plugin-mocha/node-loader-babel', pathToFileURL('./test'));
