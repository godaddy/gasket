import action from '../action-wrapper.js';
import { ConfigBuilder } from '../config-builder.js';
import { default as gasketUtils } from '@gasket/utils';

/**
 * Initializes the ConfigBuilder builder and adds to context.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function setupPkg(gasket, context) {
  const { appName, appDescription, warnings } = context;

  const pkg = ConfigBuilder.createPackageJson({
    name: appName,
    version: '0.0.0',
    description: appDescription,
    type: context.typescript ? 'commonjs' : 'module'
  }, { warnings });

  const pkgManager = new gasketUtils.PackageManager(context);
  Object.assign(context, { pkg, pkgManager });
}

export default action('Set up package.json', setupPkg, { startSpinner: false });
