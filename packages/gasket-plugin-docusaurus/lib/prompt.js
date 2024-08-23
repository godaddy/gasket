/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (context.useDocs === false) return context;
  if ('useDocusaurus' in context) return context;

  const { useDocusaurus } = await prompt([
    {
      name: 'useDocusaurus',
      message: 'Do you want to use Docusaurus for documentation?',
      type: 'confirm'
    }
  ]);

  return Object.assign({}, context, { useDocusaurus });
};
