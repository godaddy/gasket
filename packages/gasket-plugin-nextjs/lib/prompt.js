module.exports = async function promptHook(gasket, context, { prompt }) {
  const newContext = { ...context };

  if (!('nextServerType' in context)) {
    const { nextServerType } = await prompt([
      {
        name: 'nextServerType',
        message: 'Which server type would you like to use?',
        type: 'list',
        choices: [
          { name: 'Next Server(CLI)', value: 'next-cli' },
          { name: 'Custom Next Server', value: 'next-custom' }
        ]
      }
    ]);

    newContext.nextServerType = nextServerType;
  }

  if (!('addSitemap' in context)) {
    const { addSitemap } = await prompt([
      {
        name: 'addSitemap',
        message: 'Do you want to add a sitemap?',
        type: 'confirm'
      }
    ]);

    newContext.addSitemap = addSitemap;
  }

  return newContext;
};
