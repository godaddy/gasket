import { mkdir } from 'fs/promises';
import { withSpinner } from '../with-spinner.js';

/**
 * Validates this instance can execute without common blockers:
 * - Target destination on disk is available. Validate by acquiring
 * a lock through `mkdir`.
 * @type {import('../../internal.js').mkDir}
 */
async function mkDir({ context, spinner }) {
  const { dest, relDest, extant, destOverride } = context;

  // At this point, either the directory does not exist, or the user has
  // confirmed that this directory can be overwritten, so we can proceed.

  if (!extant) {
    spinner.text = `Make directory: ${relDest}`;
    await mkdir(dest);
  } else {
    spinner.text = `Existing directory: ${relDest}`;
    if (!destOverride) {
      throw new Error(`Directory ${relDest} was not allowed to be overwritten.`);
    }
  }
}

export default withSpinner('Set up directory', mkDir);
