import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  context.apiApp = true;

  await typescriptPrompts.promptTypescript(context, prompt);

  if (!('server' in context)) {
    const { server } = await prompt([
      {
        name: 'server',
        message: 'Which server framework would you like to use?',
        type: 'list',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      }
    ]);

    Object.assign(context, { server });

    return context;
  }
}
