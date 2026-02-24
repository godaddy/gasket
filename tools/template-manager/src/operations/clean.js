import fs from 'fs';
import path from 'path';
import { rmRecursive } from '../utils/fs.js';

export const name = 'clean';
export const description = 'Clean build artifacts';
export const emoji = '🧹';
export const mode = 'per-template';
/** Sync (fs.rmSync) — run one at a time so concurrency log matches behavior. */
export const concurrency = 1;

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { config } = ctx;
  const dirsToClean = (config.cleanDirs ?? []).map(d => path.join(template.templateDir, d));

  let cleaned = false;
  const log = (msg) => console.log(msg);
  for (const dirToClean of dirsToClean) {
    if (fs.existsSync(dirToClean)) {
      if (rmRecursive(dirToClean, { log })) {
        cleaned = true;
      }
    }
  }

  if (cleaned) {
    console.log('✅ Complete');
  } else {
    console.log('✅ No build artifacts to clean');
  }
}
