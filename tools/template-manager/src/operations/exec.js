export const name = 'exec';
export const description = 'Run an arbitrary command in each template';
export const emoji = '▶️';
export const mode = 'per-template';

/**
 * Runs the command from flags.positional (joined with space) via sh -c.
 * @param {object} template
 * @param {object} ctx
 */
export async function handler(template, ctx) {
  const { runner, flags } = ctx;
  const cmd = (flags.positional || []).join(' ');
  if (!cmd) {
    throw new Error('Usage: exec <command> [args...]  e.g. exec "npx next lint"');
  }
  await runner.runCommand('sh', ['-c', cmd], template.templateDir);
}
