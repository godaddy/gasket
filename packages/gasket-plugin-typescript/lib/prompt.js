/** @type {import('@gasket/plugin-typescript').promptTypescript} */
async function promptTypescript(context, prompt) {
  if ('typescript' in context) return;
  const { typescript } = await prompt([
    {
      name: 'typescript',
      message: 'Do you want to use TypeScript?',
      type: 'confirm',
      default: false
    }
  ]);

  Object.assign(context, { typescript });
}

module.exports = {
  promptTypescript
};
