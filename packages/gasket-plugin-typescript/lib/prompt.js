/// <reference types="create-gasket-app" />

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  if (context.typescript) return;

  const response = await prompt([
    {
      name: 'typescript',
      message: 'Do you want to use TypeScript?',
      type: 'confirm',
      default: false
    }
  ]);

  return { ...context, ...response };
};
