/// <reference types="@gasket/core" />

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  const newContext = { ...context };

  if (!('useAppRouter' in context)) {
    const { useAppRouter } = await prompt([
      {
        name: 'useAppRouter',
        message: 'Do you want to use the App Router? (experimental)',
        type: 'confirm',
        default: false
      }
    ]);

    newContext.useAppRouter = useAppRouter;
  }

  if (newContext.useAppRouter) {
    newContext.nextServerType = 'defaultServer';
  }

  // TODO - evaluate if these prompts should be moved to the preset
  if (!('nextServerType' in context) && !newContext.useAppRouter) {
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

    newContext.nextServerType = nextServerType;
  }

  if (
    !('nextDevProxy' in context) &&
    newContext.nextServerType === 'defaultServer'
  ) {
    const { nextDevProxy } = await prompt([
      {
        name: 'nextDevProxy',
        message: 'Do you want to add a proxy for the Next.js dev server?',
        type: 'confirm',
        default: false
      }
    ]);

    newContext.nextDevProxy = nextDevProxy;
  }

  if (!('addSitemap' in context)) {
    const { addSitemap } = await prompt([
      {
        name: 'addSitemap',
        message: 'Do you want to add a sitemap?',
        type: 'confirm',
        default: false
      }
    ]);

    newContext.addSitemap = addSitemap;
  }

  return newContext;
};
