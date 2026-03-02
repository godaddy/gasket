import fs from 'fs';
import path from 'path';
import { rmRecursive, rmFile } from '../utils/fs.js';

export const name = 'regen';
export const description = 'Regenerate lockfiles';
export const emoji = '🔒';
export const mode = 'per-template';
export const concurrency = 1;

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner, config } = ctx;
  const { templateDir } = template;
  const retryWithLegacy = config.retryWithLegacyPeerDeps ?? false;

  const packageLockPath = path.join(templateDir, 'package-lock.json');
  const nodeModulesPath = path.join(templateDir, 'node_modules');
  let cleaned = false;

  const opts = { log: (msg) => console.log(msg) };
  if (fs.existsSync(packageLockPath)) {
    if (rmFile(packageLockPath, opts)) cleaned = true;
  }
  if (fs.existsSync(nodeModulesPath)) {
    if (rmRecursive(nodeModulesPath, opts)) cleaned = true;
  }

  if (cleaned) {
    console.log('🗑️  Cleaned existing lockfiles and node_modules');
  }

  const packageJsonPath = path.join(templateDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('⚠️  No package.json found, skipping npm install');
    return;
  }

  const installArgs = config.registry ? ['install', '--registry', config.registry] : ['install'];

  console.log('📦 Running npm install to regenerate lockfiles...');
  try {
    const { code, stderr } = await runner.runCommandCaptureStderr('npm', installArgs, templateDir);
    if (code !== 0) {
      const isPeerDepError = /ERESOLVE|legacy-peer-deps|peer dep/i.test(stderr);
      if (retryWithLegacy && (isPeerDepError || code === 1)) {
        console.log('⚠️  Peer dependency conflict, retrying with --legacy-peer-deps...');
        await runner.runCommand('npm', [...installArgs, '--legacy-peer-deps'], templateDir);
      } else {
        const cmd = `npm ${installArgs.join(' ')}`;
        const detail = stderr ? `\n${stderr.trim()}` : '';
        throw new Error(`${cmd} failed with code ${code}${detail}`);
      }
    }
    console.log('✅ Lockfiles regenerated successfully');
  } catch (error) {
    console.log(`❌ Failed to regenerate lockfiles: ${error.message}`);
    throw error;
  }
}
