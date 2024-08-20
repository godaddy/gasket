/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (!('useDocs' in context)) {
    const { useDocs } = await prompt([
      {
        name: 'useDocs',
        message: 'Do you want to use generated documentation?',
        type: 'confirm'
      }
    ]);

    return Object.assign({}, context, { useDocs });
  }

  return context;
}
