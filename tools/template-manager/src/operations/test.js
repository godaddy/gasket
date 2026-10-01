import { eslintEnvFor } from '../utils/eslint-env.js';

export const name = 'test';
export const description = 'Run template tests';
export const emoji = '🧪';
export const mode = 'per-template';

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner, config } = ctx;
  const { templateDir } = template;
  await runner.runCommand('npm', ['test'], templateDir, eslintEnvFor(templateDir, config.testEnv));
}
