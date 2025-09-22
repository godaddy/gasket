/// <reference types="create-gasket-app" />
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
export default function create(gasket, { pkg, gasketConfig }) {
  gasketConfig.addEnvironment('local.analyze', {
    dynamicPlugins: [
      '@gasket/plugin-analyze'
    ]
  });

  pkg.add('devDependencies', {
    [name]: `^${version}`
  });

  pkg.add('scripts', {
    analyze: 'GASKET_ENV=local.analyze next build'
  });
}
