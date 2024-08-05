/// <reference types="@gasket/core" />

/** @type {import('./index').promptNextServerType} */
async function promptNextServerType(context, prompt) {
  if (!('nextServerType' in context)) {
    const { nextServerType } = await prompt([
      {
        name: 'nextServerType',
        message: 'Which server type would you like to use?',
        type: 'list',
        choices: [
          { name: 'App Router', value: 'appRouter' },
          { name: 'Page Router', value: 'pageRouter' },
          { name: 'Page Router w/ Custom Server', value: 'customServer' }
        ]
      }
    ]);

    Object.assign(context, { nextServerType });
  }

  if (context.nextServerType === 'appRouter') {
    // used for templating
    Object.assign(context, { useAppRouter: true });
  }
}

/** @type {import('./index').promptNextDevProxy} */
async function promptNextDevProxy(context, prompt) {
  if ('nextDevProxy' in context) return;
  const { nextServerType } = context;
  if (nextServerType === 'customServer') return;
  const { nextDevProxy } = await prompt([
    {
      name: 'nextDevProxy',
      message: 'Do you want to add a proxy for the Next.js dev server?',
      type: 'confirm',
      default: false
    }
  ]);

  Object.assign(context, { nextDevProxy });
}

/** @type {import('./index').promptSitemap} */
async function promptSitemap(context, prompt) {
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

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
async function promptAll(gasket, context, { prompt }) {
  await promptNextServerType(context, prompt);
  await promptNextDevProxy(context, prompt);
  await promptSitemap(context, prompt);

  return context;
}

module.exports = {
  prompt: promptAll,
  promptNextServerType,
  promptNextDevProxy,
  promptSitemap
};
