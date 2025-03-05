/** @type {import('.').promptSwagger} */
async function promptSwagger(context, prompt) {
  if (!('useSwagger' in context)) {
    const { useSwagger } = await prompt([
      {
        name: 'useSwagger',
        message: 'Do you want to use Swagger?',
        type: 'confirm',
        default: true
      }
    ]);

    context.useSwagger = useSwagger;
  }

  return context;
}

module.exports = {
  promptSwagger
};
