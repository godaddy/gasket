/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  context.apiApp = true;

  if (!('typescript' in context)) {
    const { typescript } = await prompt([
      {
        name: 'typescript',
        message: 'Do you want to use TypeScript?',
        type: 'confirm',
        default: false
      }
    ]);

    Object.assign(context, { typescript });
  }

  if (!('server' in context)) {
    const { server } = await prompt([
      {
        name: 'server',
        message: 'Which server type would you like to use?',
        type: 'list',
        choices: [
          { name: 'Custom Next Server', value: 'customServer' },
          { name: 'Fastify', value: 'fastify' },
          { name: 'Express', value: 'express' }
        ]
      }
    ]);

    Object.assign(context, { server });
  }
}
