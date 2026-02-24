/**
 * Operation registry.
 *
 * All operations are imported here and exposed via getOperation().
 * Each operation exports: name, description, emoji, mode, handler, and optionally:
 *   - skipResults: boolean - Don't print summary (cross-template ops that do their own reporting)
 *   - concurrency: number - Max concurrent executions (for rate-limited operations)
 *   - postRunMessage: string - Message to display after all templates complete
 */

import * as npmCi from './npm-ci.js';
import * as build from './build.js';
import * as test from './test.js';
import * as lint from './lint.js';
import * as clean from './clean.js';
import * as regen from './regen.js';
import * as updateDeps from './update-deps.js';
import * as validateDotfiles from './validate-dotfiles.js';
import * as status from './status.js';
import * as syncDeps from './sync-deps.js';
import * as peerDeps from './peer-deps.js';
import * as audit from './audit.js';
import * as addDep from './add-dep.js';
import * as removeDep from './remove-dep.js';
import * as validateStructure from './validate-structure.js';
import * as exec from './exec.js';

/** Map of operation name to operation module. */
export const operations = {
  'npm-ci': npmCi,
  'build': build,
  'test': test,
  'lint': lint,
  'clean': clean,
  'regen': regen,
  'update-deps': updateDeps,
  'validate-dotfiles': validateDotfiles,
  'status': status,
  'sync-deps': syncDeps,
  'peer-deps': peerDeps,
  'audit': audit,
  'add-dep': addDep,
  'remove-dep': removeDep,
  'validate-structure': validateStructure,
  'exec': exec
};

/**
 * Get an operation by name.
 * @param {string} name - Operation name
 * @returns {object|null} Operation module or null if not found
 */
export function getOperation(name) {
  return operations[name] ?? null;
}
