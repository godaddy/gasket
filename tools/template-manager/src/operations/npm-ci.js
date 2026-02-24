import fs from 'fs';
import path from 'path';

export const name = 'npm-ci';
export const description = 'Install template dependencies';
export const emoji = '📦';
export const mode = 'per-template';

function shouldSkipNpmCi(templateDir) {
  const nodeModulesPath = path.join(templateDir, 'node_modules');
  const packageJsonPath = path.join(templateDir, 'package.json');
  const packageLockPath = path.join(templateDir, 'package-lock.json');

  if (!fs.existsSync(nodeModulesPath)) return false;

  try {
    const contents = fs.readdirSync(nodeModulesPath);
    if (contents.length === 0) return false;
  } catch {
    return false;
  }

  let nodeModulesStat;
  try {
    nodeModulesStat = fs.statSync(nodeModulesPath);
  } catch {
    return false;
  }

  const filesToCheck = [packageJsonPath, packageLockPath].filter(p => fs.existsSync(p));
  for (const filePath of filesToCheck) {
    try {
      const fileStat = fs.statSync(filePath);
      if (fileStat.mtime > nodeModulesStat.mtime) return false;
    } catch {
      // continue
    }
  }
  return true;
}

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner, config } = ctx;
  const { templateDir } = template;

  if (shouldSkipNpmCi(templateDir)) {
    console.log(`⚡ Skipping ${template.name}/template - dependencies are up to date`);
    return;
  }

  const baseArgs = config.npmCiArgs ?? ['ci', '--prefer-offline'];
  const args = config.registry ? [...baseArgs, '--registry', config.registry] : baseArgs;
  const retryWithLegacy = config.retryWithLegacyPeerDeps ?? false;

  try {
    await runner.runCommand('npm', args, templateDir);
    console.log('✅ Dependencies installed successfully');
  } catch {
    if (!retryWithLegacy) throw new Error('npm ci failed');

    console.log('⚠️  npm ci failed, retrying with --legacy-peer-deps...');
    try {
      await runner.runCommand('npm', [...args, '--legacy-peer-deps'], templateDir);
      console.log('✅ Dependencies installed successfully with --legacy-peer-deps');
    } catch (retryError) {
      console.log(`❌ Failed even with --legacy-peer-deps: ${retryError.message}`);
      throw retryError;
    }
  }
}
