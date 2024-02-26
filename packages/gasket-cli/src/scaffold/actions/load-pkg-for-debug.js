import path from 'path';
import fs from 'fs/promises';
import action from '../action-wrapper.js';
import { ConfigBuilder } from '../config-builder.js';

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

export default action('Load package.json for debug. 🐲 Here be dragons!', loadPkForDebug);
