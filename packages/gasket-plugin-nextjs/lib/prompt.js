/// <reference types="@gasket/cli" />

/** @type {import('@gasket/engine').HookHandler<'prompt'>} */
module.exports = async function (gasket, context, { prompt }) {
  if (!('addSitemap' in context)) {
    const { addSitemap } = await prompt([
      {
        name: 'addSitemap',
        message: 'Do you want to add a sitemap?',
        type: 'confirm'
      }
    ]);

    return { ...context, addSitemap };
  }
  return context;
};
