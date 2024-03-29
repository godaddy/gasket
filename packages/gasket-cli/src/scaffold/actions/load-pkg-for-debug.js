const path = require('path');
const fs = require('fs').promises;
const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');

/**
 * Debug-only load existing app package.json for context.pkg
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function loadPkForDebug(context) {
  const { dest, warnings } = context;

  const filePath = path.join(dest, 'package.json');

  const contents = await fs.readFile(filePath, 'utf8');
  const fields = JSON.parse(contents);
  const pkg = ConfigBuilder.createPackageJson(fields, { warnings });

  Object.assign(context, { pkg });
}

module.exports = action('Load package.json for debug. 🐲 Here be dragons!', loadPkForDebug);
