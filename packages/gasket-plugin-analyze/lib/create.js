/// <reference types="create-gasket-app" />
import packageJson from '../package.json' with { type: 'json' };
const { name, version } = packageJson;

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
    analyze: 'GASKET_ENV=local.analyze next build --webpack'
  });
}
