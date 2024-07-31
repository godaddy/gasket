import nextJsPrompts from '@gasket/plugin-nextjs/prompts';
import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  await typescriptPrompts.promptTypescript(context, prompt);
  await nextJsPrompts.promptNextServerType(context, prompt);
  await nextJsPrompts.promptNextDevProxy(context, prompt);

  if (!('server' in context) && context.nextServerType === 'customServer') {
    const { server } = await prompt([
      {
        name: 'server',
        message: 'Which custom server framework would you like to use?',
        type: 'list',
        choices: [
          { name: 'Express', value: 'express' },
          { name: 'Fastify', value: 'fastify' }
        ]
      }
    ]);

    Object.assign(context, { server });
  }
}
