import path from 'path';
import os from 'os';
import action from '../action-wrapper.js';
import { default as gasketUtils } from '@gasket/utils';
import { mkdtemp } from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * loadPresets - Load presets to temp directory
 * @param {null} _ - no input
 * @param {CreateContext} context - Create context
 */
async function loadPresets(_, context) {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `gasket-create-${context.appName}`));
  context.tmpDir = tmpDir;

  const modPath = path.join(tmpDir, 'node_modules');
  const pkgManager = new gasketUtils.PackageManager({
    packageManager: context.packageManager,
    dest: tmpDir
  });
  const pkgVerb = pkgManager.isYarn ? 'add' : 'install';

  const remotePresets = context.rawPresets.map(async preset => {
    const parts = /@(\^[0-9]\.|[0-9]).+/.test(preset) && preset.split('@').filter(Boolean);
    const name = parts ? `@${parts[0]}` : preset;
    const version = parts ? `@${parts[1]}` : '@latest';
    await pkgManager.exec(pkgVerb, [`${name}${version}`]);
    const mod = await import(name, { from: modPath });
    return mod.default || mod;
  });

  const localPresets = context.localPresets.map(async localPresetPath => {
    await pkgManager.exec(pkgVerb, [localPresetPath]);
    const pkgFile = require(path.join(localPresetPath, 'package.json'));
    const mod = await import(pkgFile.name, { from: modPath });
    return mod.default || mod;
  });

  context.presets = await Promise.all([...remotePresets, ...localPresets]);
}

export default action('Load presets', loadPresets);
