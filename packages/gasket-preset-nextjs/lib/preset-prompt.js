function prompts(context, prompt) {
  return {
    async promptTypescript() {
      if ('typescript' in context) return;
      const { typescript } = await prompt([
        {
          name: 'typescript',
          message: 'Do you want to use TypeScript?',
          type: 'confirm',
          default: false
        }
      ]);

      Object.assign(context, { typescript });
    },
    async promptAppRouter() {
      if ('useAppRouter' in context) return;
      const { useAppRouter } = await prompt([
        {
          name: 'useAppRouter',
          message: 'Do you want to use the App Router? (experimental)',
          type: 'confirm',
          default: false
        }
      ]);

      const ctx = useAppRouter ? { useAppRouter, nextServerType: 'defaultServer' } : { useAppRouter };
      Object.assign(context, ctx);
    },
    async promptNextServerType() {
      if ('nextServerType' in context) return;
      if (context.useAppRouter) return;
      const { nextServerType } = await prompt([
        {
          name: 'nextServerType',
          message: 'Which server type would you like to use?',
          type: 'list',
          choices: [
            { name: 'Next Server(CLI)', value: 'defaultServer' },
            { name: 'Custom Next Server', value: 'customServer' }
          ]
        }
      ]);

      Object.assign(context, { nextServerType });
    },
    async promptNextDevProxy() {
      if ('nextDevProxy' in context) return;
      if (context.nextServerType !== 'defaultServer') return;
      const { nextDevProxy } = await prompt([
        {
          name: 'nextDevProxy',
          message: 'Do you want to add a proxy for the Next.js dev server?',
          type: 'confirm',
          default: false
        }
      ]);

      Object.assign(context, { nextDevProxy });
    },
    async promptServer() {
      if ('server' in context) return;
      if (context.nextServerType === 'defaultServer') return;
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
    },
    async promptSitemap() {
      if ('addSitemap' in context) return;
      const { addSitemap } = await prompt([
        {
          name: 'addSitemap',
          message: 'Do you want to add a sitemap?',
          type: 'confirm',
          default: false
        }
      ]);

      Object.assign(context, { addSitemap });
    }
  };
}

/**
 * presetPrompt hook
 * @param {Gasket} gasket - Gasket API
 * @param {Create} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 */
export default async function presetPrompt(gasket, context, { prompt }) {
  const {
    promptTypescript,
    promptAppRouter,
    promptNextServerType,
    promptNextDevProxy,
    promptServer,
    promptSitemap
  } = prompts(context, prompt);
  await promptTypescript();
  await promptAppRouter();
  await promptNextServerType();
  await promptNextDevProxy();
  await promptServer();
  await promptSitemap();
}
