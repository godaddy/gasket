const codeStyles = require('./code-styles');
const { makeGatherDevDeps, makeRunScriptStr, makeSafeRunScript } = require('./utils');

module.exports = {
  name: 'lint',
  hooks: {
    /**
     * Prompt lifecycle hook which prompts for code style choices.
     *
     * @param {Gasket} gasket - Gasket API
     * @param {CreateContext} context - Create context
     * @param {function} prompt - Inquirer prompt
     * @returns {Promise<object>} context with prompt results
     */
    async prompt(gasket, context, { prompt }) {
      //
      // Assume prompts are not needed if some lint configuration found in context
      //
      if (['codeStyle', 'eslintConfig', 'stylelintConfig'].some(k => k in context)) {
        return context;
      }

      const choices = Object.keys(codeStyles)
        .map(value => ({ value, name: codeStyles[value].name }))
        .filter(choice => choice.name);

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
          when: answers => answers.codeStyle === 'other',
          transformer: value => value.startsWith('@') ? value : `eslint-config-${value}`
        },
        {
          name: 'addStylelint',
          message: 'Do you want stylelint configured?',
          type: 'confirm',
          when: answers => codeStyles[answers.codeStyle].allowStylelint
        },
        {
          type: 'input',
          name: 'stylelintConfig',
          message: 'What is the name of the stylelint config?',
          when: answers => answers.addStylelint && answers.codeStyle === 'other',
          transformer: value => value.startsWith('@') ? value : `stylelint-config-${value}`
        }
      ]);

      return { ...context, ...results };
    },

    /**
     * Create lifecycle hook which executes _last_ in order to be able to inspect
     * what has been added to the package.json by other plugins.
     */
    create: {
      timing: {
        last: true
      },
      /**
       * Sets up the package.json with necessary dependencies and settings for
       * selected code styles and configs.
       *
       * @param {Gasket} gasket - Gasket API
       * @param {CreateContext} context - Create context
       * @returns {Promise<void>} promise
       */
      handler: async function createHook(gasket, context) {
        const { codeStyle, eslintConfig } = context;

        //
        // If on eslintConfig has been set, set codeStyle to other
        // If codeStyle or eslintConfig have not been set somehow, default to none.
        //
        const selectedCodeStyle = codeStyle || (eslintConfig && 'other') || 'none';

        if (selectedCodeStyle !== 'none') {
          const gatherDevDeps = makeGatherDevDeps(context);
          const runScriptStr = makeRunScriptStr(context);

          /**
           * @typedef {object} CodeStyleUtils
           *
           * @property {function(moduleName)} gatherDevDeps - Looks up devDeps needed for a module
           * @property {function} runScriptStr - Helper to make the `npm run <cmd>` or `yarn <cmd>` string
           */
          const utils = { gatherDevDeps, runScriptStr };

          await codeStyles[selectedCodeStyle].create(context, utils);
          await codeStyles.common.create(context, utils);
        }
      }
    },

    /**
     * Runs fix scripts after the app is finished being created.
     *
     * @param {Gasket} gasket - Gasket API
     * @param {CreateContext} context - Create context
     * @param {Function} runScript - function to run package scripts in the app
     * @returns {Promise} promise
     * @private
     */
    async postCreate(gasket, context, { runScript }) {
      const safeRunScript = makeSafeRunScript(context, runScript);
      await safeRunScript('lint:fix');
      await safeRunScript('stylelint:fix');
    }
  }
};
