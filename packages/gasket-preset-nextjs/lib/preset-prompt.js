import {
  promptNextServerType,
  promptNextDevProxy
} from '@gasket/plugin-nextjs/prompts';
import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  await typescriptPrompts.promptTypescript(context, prompt);
  await promptNextServerType(context, prompt);
  await promptNextDevProxy(context, prompt);

  return context;
}
