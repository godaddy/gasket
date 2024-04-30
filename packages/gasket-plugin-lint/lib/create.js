const codeStyles = require('./code-styles');
const { makeGatherDevDeps, makeRunScriptStr } = require('./utils');

/**
 * Create lifecycle hook which executes _last_ in order to be able to
 * inspect what has been added to the package.json by other plugins.ß
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
async function create(gasket, context) {
  const { codeStyle, eslintConfig, stylelintConfig } = context;

  // Use codeStyle if set. If eslint or stylelint config has been set, set
  // codeStyle to `other`. Otherwise, default to `none`.
  const selectedCodeStyle =
    codeStyle || ((eslintConfig || stylelintConfig) && 'other') || 'none';

  if (selectedCodeStyle !== 'none') {
    const gatherDevDeps = makeGatherDevDeps(context);
    const runScriptStr = makeRunScriptStr(context);
    const utils = { gatherDevDeps, runScriptStr };

    await codeStyles[selectedCodeStyle].create(context, utils);
    await codeStyles.common.create(context, utils);
  }
}

module.exports = {
  timing: {
    last: true
  },
  handler: create
};
