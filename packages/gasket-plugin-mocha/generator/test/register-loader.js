import { register } from 'module';
import { pathToFileURL } from 'url';

register('./test/node-loader-babel.js', pathToFileURL('./test'));
