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
  await runner.runCommand('npm', ['test'], template.templateDir, config.testEnv ?? {});
}
