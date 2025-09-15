import { withSpinner } from '../with-spinner.js';
import { PackageManager } from '@gasket/utils';
import { rm } from 'fs/promises';

/**
 * Safely cleans up temporary directory
 * @param {string} tmpDir - Temporary directory path
 * @returns {Promise<void>}
 */
async function cleanupTempDir(tmpDir) {
  if (!tmpDir) return;

  try {
    await rm(tmpDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Checks if an error is related to peer dependencies
 * @param {Error & { stderr?: string }} error - The error to check
 * @returns {boolean} True if error is peer dep related
 */
function isPeerDependencyError(error) {
  const errorMessage = (error.stderr || error.message || '').toLowerCase();
  return errorMessage.includes('peer dep') ||
    errorMessage.includes('peerinvalid') ||
    errorMessage.includes('peer dependencies') ||
    errorMessage.includes('eresolve');
}

/**
 * Installs dependencies in the destination directory and cleans up temporary files
 * @param {object} options - Options object
 * @param {object} options.context - Gasket context
 * @returns {Promise<void>}
 */
async function installTemplateDep({ context }) {
  const destPkgManager = new PackageManager({
    packageManager: 'npm',
    dest: context.dest
  });

  try {
    await destPkgManager.exec('ci');
    await cleanupTempDir(context.tmpDir);
    context.messages.push(`Template ${context.templateName} dependencies installed`);
  } catch (error) {
    if (isPeerDependencyError(error)) {
      console.warn('Peer dependency conflict detected, retrying with --legacy-peer-deps...');
      try {
        await destPkgManager.exec('ci', ['--legacy-peer-deps']);
        await cleanupTempDir(context.tmpDir);
        context.messages.push(`Template ${context.templateName} dependencies installed with --legacy-peer-deps`);
      } catch (retryError) {
        await cleanupTempDir(context.tmpDir);
        throw new Error(`Failed to install dependencies even with --legacy-peer-deps: ${retryError.message}`);
      }
    } else {
      await cleanupTempDir(context.tmpDir);
      throw error;
    }
  }
}

export default withSpinner('Install template dependencies', installTemplateDep);
