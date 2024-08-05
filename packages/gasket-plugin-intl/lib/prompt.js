/**
 * Prompt lifecycle hook
 *
 * We do not actually prompt from here, but rather use this lifecycles to make
 * sure the ReduxReducers instances is available on context during the create
 * lifecycle.
 * @type {import('@gasket/core').HookHandler<'prompt'>}
 */
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (!('hasGasketIntl' in context)) {
    const { useGasketIntl } = await prompt([
      {
        name: 'useGasketIntl',
        message: 'Do you want internationalization support?',
        type: 'confirm',
        default: true
      }
    ]);

    context.hasGasketIntl = useGasketIntl;
  }

  return context;
};
