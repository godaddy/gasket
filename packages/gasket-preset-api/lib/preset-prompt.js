export default async function presetPrompt(gasket, context, { prompt }) {
  context.apiApp = true;

  if (!('typescript' in context)) {
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
}
