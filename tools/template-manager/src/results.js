/**
 * Result tracking and summary reporting.
 *
 * Tracks pass/fail/skip status for each template and prints
 * a formatted summary at the end of operation execution.
 */

import chalk from 'chalk';

/**
 * Create a results tracker for an operation.
 * @param {string} operationName - Name of the operation (for display)
 * @returns {object} Results tracker with record, hasFailures, summary methods
 * @example
 *   const results = createResults('build');
 *   results.record('gasket-template-webapp-app', 'passed');
 *   results.record('gasket-template-api-express', 'failed', 'npm build exited with code 1');
 *   results.summary();
 *   // 📊 build: 1 passed, 1 failed, 0 skipped
 *   //   ✅ gasket-template-webapp-app
 *   //   ❌ gasket-template-api-express — npm build exited with code 1
 */
export function createResults(operationName) {
  /** @type {Array<{ name: string, status: 'passed'|'failed'|'skipped', error?: string }>} */
  const entries = [];

  return {
    /**
     * Record a result for a template.
     * @param {string} name - Template name
     * @param {'passed'|'failed'|'skipped'} status - Result status
     * @param {string} [error] - Error message (for failed/skipped)
     */
    record(name, status, error) {
      entries.push({ name, status, error });
    },

    /**
     * Check if any templates failed.
     * @returns {boolean}
     */
    hasFailures() {
      return entries.some(e => e.status === 'failed');
    },

    /**
     * Print summary to console.
     */
    summary() {
      const passed = entries.filter(e => e.status === 'passed').length;
      const failed = entries.filter(e => e.status === 'failed').length;
      const skipped = entries.filter(e => e.status === 'skipped').length;

      console.log('');
      console.log(chalk.bold(`📊 ${operationName}: ${passed} passed, ${failed} failed, ${skipped} skipped`));
      console.log('');

      for (const e of entries) {
        if (e.status === 'passed') {
          console.log(chalk.green(`  ✅ ${e.name}`));
        } else if (e.status === 'failed') {
          console.log(chalk.red(`  ❌ ${e.name}${e.error ? ` — ${e.error}` : ''}`));
        } else {
          console.log(chalk.gray(`  ⏭️  ${e.name}${e.error ? ` — ${e.error}` : ''}`));
        }
      }
      console.log('');
    }
  };
}
