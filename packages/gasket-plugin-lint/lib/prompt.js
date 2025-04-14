/// <reference types="@gasket/plugin-express" />
/// <reference types="create-gasket-app" />

const codeStyles = require('./code-styles');

/** @type {import('@gasket/core').HookHandler<'prompt'>} */
module.exports = async function promptHook(gasket, context, { prompt }) {
  // Assume prompts are not needed if some lint configuration found in context
  if (
    ['codeStyle', 'eslintConfig', 'stylelintConfig'].some((k) => k in context)
  ) {
    return context;
  }

  const choices = Object.keys(codeStyles)
    .map((value) => ({ value, name: codeStyles[value].name }))
    .filter((choice) => choice.name);

  const results = await prompt([
    {
      type: 'list',
      name: 'codeStyle',
      message: 'Which code style do you want configured?',
      choices
    },
    {
      name: 'addStylelint',
      message: 'Do you want stylelint configured?',
      type: 'confirm',
      when: (answers) => !context.apiApp && codeStyles[answers.codeStyle].allowStylelint
    }
  ]);

  return { ...context, ...results };
};
