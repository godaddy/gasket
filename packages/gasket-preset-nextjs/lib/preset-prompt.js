import {
  promptNextServerType,
  promptNextDevProxy
} from '@gasket/plugin-nextjs/prompts';
import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/**
 * presetPrompt hook
 * @type {import('@gasket/core').PresetHook<'presetPrompt'>}
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  await typescriptPrompts.promptTypescript(context, prompt);
  await promptNextServerType(context, prompt);
  await promptNextDevProxy(context, prompt);

  return context;
}
