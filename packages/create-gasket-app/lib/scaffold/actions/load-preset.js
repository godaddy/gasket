import path from 'path';
import os from 'os';
import action from '../action-wrapper.js';
import { PackageManager } from '@gasket/utils';
import { mkdtemp } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const hasVersionOrTag = /@([\^~]?\d+\.\d+\.\d+(?:-[\d\w.-]+)?|[\^~]?\d+\.\d+\.\d+|[a-zA-Z]+|file:.+)$/;

/**
 * loadPresets - Load presets to temp directory
 * @type {import('../../internal').loadPresets}
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
      const mod = await import(`${modPath}/${name}/${pkgFile.main}`);
      return mod.default?.default || mod.default || mod;
    } catch (err) {
      throw new Error(`Failed to install preset ${name}${version}: ${err.message}`);
    }
  });

  const localPresets = context.localPresets.map(async localPresetPath => {

    try {
      await pkgManager.exec(pkgVerb, [localPresetPath]);
      const pkgFile = require(path.join(localPresetPath, 'package.json'));
      const mod = await import(`${modPath}/${pkgFile.name}/${pkgFile.main}`);
      return mod.default?.default || mod.default || mod;
    } catch (err) {
      throw new Error(`Failed to install local preset ${localPresetPath}`);
    }
  });

  context.presets = await Promise.all([...remotePresets, ...localPresets]);
}

export default action('Load presets', loadPresets);
