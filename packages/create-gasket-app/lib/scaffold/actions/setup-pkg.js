import action from '../action-wrapper.js';
import { ConfigBuilder } from '../config-builder.js';
import { PackageManager } from '@gasket/utils';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { dependencies } = require('../../../package.json');

/**
 * Initializes the ConfigBuilder builder and adds to context.
 * @type {import('../../internal').setupPkg}
 */
async function setupPkg({ context }) {
  const { appName, appDescription, warnings } = context;

  const pkg = ConfigBuilder.createPackageJson({
    name: appName,
    version: '0.0.0',
    description: appDescription,
    type: 'module'
  }, { warnings });

  // Add critical dependencies
  pkg.add('dependencies', {
    '@gasket/core': dependencies['@gasket/core'],
    '@gasket/utils': dependencies['@gasket/utils']
  });

  const pkgManager = new PackageManager(context);
  Object.assign(context, { pkg, pkgManager });
}

export default action('Set up package.json', setupPkg, { startSpinner: false });
