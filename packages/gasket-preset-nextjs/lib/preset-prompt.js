// Default Plugins Prompts - included by default for all presets
import docsPrompts from '@gasket/plugin-docs/prompts';
import docusaurusPrompts from '@gasket/plugin-docusaurus/prompts';
import gitPrompts from '@gasket/plugin-git/prompts';

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
  await docsPrompts(gasket, context, { prompt });
  await docusaurusPrompts(gasket, context, { prompt });
  await gitPrompts(gasket, context, { prompt });

  await typescriptPrompts.promptTypescript(context, prompt);
  await nextJsPrompts.promptNextServerType(context, prompt);
  await nextJsPrompts.promptNextDevProxy(context, prompt);

  return context;
}
