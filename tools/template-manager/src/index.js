#!/usr/bin/env node
/**
 * Template Manager - Entry Point
 *
 * Orchestrates operation execution across template packages.
 * Handles template discovery, filtering, concurrency, and result tracking.
 */

import chalk from 'chalk';
import config from './config.js';
import { parseArgv, showUsage } from './cli.js';
import { discoverTemplates } from './discovery.js';
import { createRunner } from './runner.js';
import { createResults } from './results.js';
import { getOperation } from './operations/index.js';

/**
 * Filter templates by --only flag (substring match).
 * @param {Array} templates - All discovered templates
 * @param {string[]} only - Substrings to match against template names
 * @returns {Array} Filtered templates
 */
function filterTemplates(templates, only) {
  if (!only || only.length === 0) return templates;
  return templates.filter(t => only.some(o => t.name.includes(o)));
}

/**
 * Main entry point.
 */
async function main() {
  const { operation, flags } = parseArgv(process.argv);

  if (!operation) {
    showUsage();
    process.exit(0);
  }

  const op = getOperation(operation);
  if (!op) {
    console.error(`Unknown operation: ${operation}`);
    showUsage();
    process.exit(1);
  }

  const templates = discoverTemplates(config);
  const filtered = filterTemplates(templates, flags.only);

  if (templates.length === 0) {
    console.log('No template packages found.');
    process.exit(0);
  }

  if (filtered.length !== templates.length) {
    console.log(`Running for ${filtered.length} template(s) (filtered by --only)`);
  }
  console.log('');

  const runner = createRunner(msg => console.log(msg));
  const results = createResults(operation);
  const ctx = {
    runner,
    config,
    results,
    flags,
    templates: filtered
  };

  // Record skipped templates
  for (const t of templates) {
    if (!filtered.includes(t)) {
      results.record(t.name, 'skipped', 'filtered by --only');
    }
  }

  // Cross-template operations manage their own iteration
  if (op.mode === 'cross-template') {
    try {
      console.log(`${op.emoji} ${op.name}`);
      await op.handler(filtered, ctx);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    if (!op.skipResults) results.summary();
    process.exit(results.hasFailures() ? 1 : 0);
  }

  // Per-template operations are orchestrated here
  if (op.mode !== 'per-template') {
    console.error(`Operation ${operation} has unsupported mode.`);
    process.exit(1);
  }

  const concurrency = Math.min(flags.concurrency, op.concurrency ?? Infinity);
  console.log(`Running with concurrency: ${concurrency}`);

  /**
   * Execute operation for a single template.
   */
  const runOne = async (template) => {
    try {
      console.log(`${op.emoji} ${op.name} ${template.name}/template`);
      await op.handler(template, ctx);
      results.record(template.name, 'passed');
    } catch (error) {
      results.record(template.name, 'failed', error.message);
      if (flags.bail) throw error;
    }
  };

  // Sequential execution
  if (concurrency <= 1) {
    for (const template of filtered) {
      await runOne(template);
    }
  } else {
    // Parallel execution with worker pool
    const queue = [...filtered];
    const runNext = async () => {
      while (queue.length > 0) {
        if (flags.bail && results.hasFailures()) break;
        const template = queue.shift();
        try {
          await runOne(template);
        } catch {
          break;
        }
      }
    };
    const workers = Math.min(concurrency, filtered.length);
    await Promise.all(Array.from({ length: workers }, runNext));
  }

  if (op.postRunMessage) {
    console.log(chalk.gray('\n' + op.postRunMessage + '\n'));
  }
  if (!op.skipResults) results.summary();
  process.exit(results.hasFailures() ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
