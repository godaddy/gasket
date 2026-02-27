export const name = 'build';
export const description = 'Build templates';
export const emoji = '🔨';
export const mode = 'per-template';

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner } = ctx;
  await runner.runCommand('npm', ['run', 'build'], template.templateDir);
}
