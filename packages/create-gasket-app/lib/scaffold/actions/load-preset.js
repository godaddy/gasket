import path from 'path';
import os from 'os';
import { withSpinner } from '../with-spinner.js';
import { PackageManager } from '@gasket/utils';
import { mkdtemp } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const hasVersionOrTag = /@([\^~]?\d+\.\d+\.\d+(?:-[\d\w.-]+)?|[\^~]?\d+\.\d+\.\d+|[a-zA-Z]+|file:.+)$/;

/**
 * validatePresetName - Validate the preset name
 * @param {string} preset - The preset name
 * @returns {void}
 */
function validatePresetName(preset) {
  const isNotShortName = preset.includes('/gasket-preset-') || preset.includes('@gasket/preset-');
  const isMispelled = preset.endsWith('-preset');

  if (isMispelled) {
    throw new Error(`Invalid preset name: ${preset}. Please check the name and try again.`);
  }

  if (!isNotShortName) {
    throw new Error(`Invalid preset short name: ${preset}. Presets must be a full name.`);
  }
}

/**
 * loadPresets - Load presets to temp directory
 * @type {import('../../internal.js').loadPresets}
 */
async function loadPresets({ context }) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-create-${context.appName}`));
  context.tmpDir = tmpDir;

  const modPath = path.join(tmpDir, 'node_modules');
  const pkgManager = new PackageManager({
    packageManager: context.packageManager,
    dest: tmpDir
  });
  const pkgVerb = pkgManager.manager === 'npm' ? 'install' : 'add';

  const remotePresets = context.rawPresets.map(async preset => {
    validatePresetName(preset);
    const parts = hasVersionOrTag.test(preset) && preset.split('@').filter(Boolean);
    const name = parts ? `@${parts[0]}` : preset;
    const version = parts ? `@${parts[1]}` : '@latest';

    try {
      // Install the preset
      await pkgManager.exec(pkgVerb, [`${name}${version}`]);
      // Get the package file
      const pkgFile = require(path.join(modPath, name, 'package.json'));
      // Import the preset via the package file attrs, name and main
      // We can't specify the cwd for the import, so we need to use the full path
      // expects type:module & "main": "lib/fullpath.js"
      const entryPath = pkgFile.main ?? pkgFile.exports['.'].import ?? pkgFile.exports['.'].default;
      const mod = await import(`${modPath}/${name}/${entryPath}`);
      return mod.default?.default || mod.default || mod;
    } catch (err) {
      const errorMessage = err.stderr || err.message;
      if (err.stderr && err.stderr.includes('is not in this registry')) {
        throw new Error(`Preset not found in registry: ${name}${version}. Use npm_config_registry=<registry> to use privately scoped presets.`);
      }

      throw new Error(`Failed to install preset ${name}${version}: ${errorMessage}`);
    }
  });

  const localPresets = context.localPresets.map(async localPresetPath => {
    try {
      await pkgManager.exec(pkgVerb, [localPresetPath]);
      const pkgFile = require(path.join(localPresetPath, 'package.json'));
      const entryPath = pkgFile.main ?? pkgFile.exports['.'].import ?? pkgFile.exports['.'].default;
      const mod = await import(`${modPath}/${pkgFile.name}/${entryPath}`);
      return mod.default?.default || mod.default || mod;
    } catch (err) {
      throw new Error(`Failed to install local preset ${localPresetPath}`);
    }
  });

  context.presets = await Promise.all([...remotePresets, ...localPresets]);
}

export default withSpinner('Load presets', loadPresets);
