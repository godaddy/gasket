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
  // Run the template's own lint script so the tool stays agnostic of the
  // ESLint config format (eslintrc vs flat) each template uses.
  await runner.runCommand('npm', ['run', 'lint'], template.templateDir, config.lintEnv ?? {});
}
