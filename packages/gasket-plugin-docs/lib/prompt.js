/** @type {import('@gasket/core').HookHandler<'prompt'>} */
export default async function promptHook(gasket, context, { prompt }) {
  if ('useDocs' in context) return context;

  const { useDocs } = await prompt([
    {
      name: 'useDocs',
      message: 'Do you want to use generated documentation?',
      type: 'confirm'
    }
  ]);

  return Object.assign({}, context, { useDocs });
}
