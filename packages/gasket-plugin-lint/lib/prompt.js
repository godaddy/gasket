const codeStyles = require('./code-styles');

/** @type {import('@gasket/engine').HookHandler<'prompt'>} */
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
      type: 'input',
      name: 'eslintConfig',
      message: 'What is the name of the eslint config?',
      when: (answers) => answers.codeStyle === 'other',
      transformer: (value) =>
        value.startsWith('@') ? value : `eslint-config-${value}`
    },
    {
      name: 'addStylelint',
      message: 'Do you want stylelint configured?',
      type: 'confirm',
      when: (answers) => codeStyles[answers.codeStyle].allowStylelint
    },
    {
      type: 'input',
      name: 'stylelintConfig',
      message: 'What is the name of the stylelint config?',
      when: (answers) => answers.addStylelint && answers.codeStyle === 'other',
      transformer: (value) =>
        value.startsWith('@') ? value : `stylelint-config-${value}`
    }
  ]);

  return { ...context, ...results };
};
