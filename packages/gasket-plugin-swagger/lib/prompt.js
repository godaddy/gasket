/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  if ('useSwagger' in context) return context;

  const { useSwagger } = await prompt([
    {
      name: 'useSwagger',
      message: 'Do you want to use Swagger?',
      type: 'confirm',
      default: true
    }
  ]);

  return Object.assign({}, context, { useSwagger });
};
