export const name = 'lint';
export const description = 'Lint templates';
export const emoji = '🔍';
export const mode = 'per-template';

/**
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner, config } = ctx;
  await runner.runCommand(
    'npx',
    ['eslint', '--ext', '.js,.jsx,.cjs,.ts,.tsx', '.'],
    template.templateDir,
    config.lintEnv ?? {}
  );
}
