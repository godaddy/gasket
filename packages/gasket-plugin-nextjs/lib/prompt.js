/// <reference types="@gasket/core" />

/** @type {import('./index').promptAppRouter} */
async function promptAppRouter(context, prompt) {
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
};

/** @type {import('./index').promptNextServerType} */
async function promptNextServerType(context, prompt) {
  if ('nextServerType' in context) return;
  const { useAppRouter } = context;
  if (useAppRouter) return;
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
};

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
};

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
};

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
async function prompt(gasket, context, { prompt }) {
  await promptAppRouter(context, prompt);
  await promptNextServerType(context, prompt);
  await promptNextDevProxy(context, prompt);
  await promptSitemap(context, prompt);

  return context;
};

module.exports = {
  prompt,
  promptAppRouter,
  promptNextServerType,
  promptNextDevProxy,
  promptSitemap
};
