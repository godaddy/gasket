/// <reference types="create-gasket-app" />

// Default Plugins
import docsPrompts from '@gasket/plugin-docs/prompts';
import docusaurusPrompts from '@gasket/plugin-docusaurus/prompts';
import gitPrompts from '@gasket/plugin-git/prompts';

import lintPrompts from '@gasket/plugin-lint/prompts';
import swaggerPrompts from '@gasket/plugin-swagger/prompts';
import typescriptPrompts from '@gasket/plugin-typescript/prompts';

/** @type {import('@gasket/core').HookHandler<'presetPrompt'>} */
export default async function presetPrompt(gasket, context, { prompt }) {
  context.apiApp = true;

  await docsPrompts(gasket, context, { prompt });
  await docusaurusPrompts(gasket, context, { prompt });
  await gitPrompts(gasket, context, { prompt });

  await lintPrompts(gasket, context, { prompt });
  await swaggerPrompts(gasket, context, { prompt });
  await typescriptPrompts(gasket, context, { prompt });

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
