const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const promptHook = require('../lib').hooks.prompt;
const codeStyles = require('../lib/code-styles');

describe('prompt hook', function () {
  let gasket, context, prompt, mockAnswers;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { codeStyle: 'godaddy' };
    prompt = sinon.stub().callsFake(() => mockAnswers);
  });

  it('prompts', async () => {
    await promptHook(gasket, context, { prompt });
    assume(prompt).called();
  });

  it('does not prompt if lint settings detected', async () => {
    await promptHook(gasket, { codeStyle: 'godaddy' }, { prompt });
    assume(prompt).not.called();
    await promptHook(gasket, { eslintConfig: 'godaddy' }, { prompt });
    assume(prompt).not.called();
    await promptHook(gasket, { stylelintConfig: 'godaddy' }, { prompt });
    assume(prompt).not.called();
  });

  it('returns unmodified context if no prompts', async () => {
    context = { codeStyle: 'godaddy' };
    const result = await promptHook(gasket, context, { prompt });
    assume(result).equals(context);
  });

  it('returns modified context with prompt answers', async () => {
    context = { bogus: true };
    const result = await promptHook(gasket, context, { prompt });
    assume(result).not.equals(context);
    assume(result).eqls({ ...context, ...mockAnswers });
  });

  it('codeStyle question shown presents expected choices', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][0];
    assume(question.name).equals('codeStyle');
    assume(question.choices).length(Object.keys(codeStyles).length - 1);
    assume(question.choices.map(c => c.value)).eqls(Object.keys(codeStyles).filter(name => name !== 'common'));
  });

  it('eslintConfig question shown when codeStyle is `other`', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][1];
    assume(question.name).equals('eslintConfig');
    assume(question.when({ codeStyle: 'other' })).true();
    assume(question.when({ codeStyle: 'godaddy' })).not.true();
    assume(question.when({ codeStyle: 'standard' })).not.true();
    assume(question.when({ codeStyle: 'none' })).not.true();
  });

  it('eslintConfig question transforms input for short names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][1];
    assume(question.name).equals('eslintConfig');
    assume(question.transformer('short')).equals('eslint-config-short');
  });

  it('eslintConfig question does not transform for scoped names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][1];
    assume(question.name).equals('eslintConfig');
    assume(question.transformer('@scope/config')).equals('@scope/config');
  });

  it('addStylelint question shown only codeStyle has support', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][2];
    assume(question.name).equals('addStylelint');
    assume(question.when({ codeStyle: 'other' })).true();
    assume(question.when({ codeStyle: 'godaddy' })).true();
    assume(question.when({ codeStyle: 'standard' })).not.true();
  });

  it('stylelintConfig question shown when codeStyle is `other`', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][3];
    assume(question.name).equals('stylelintConfig');
    assume(question.when({ addStylelint: true, codeStyle: 'other' })).true();
    assume(question.when({ addStylelint: true, codeStyle: 'godaddy' })).not.true();
  });

  it('stylelintConfig question not shown if addStylelint=false', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][3];
    assume(question.name).equals('stylelintConfig');
    assume(question.when({ addStylelint: false, codeStyle: 'other' })).not.true();
    assume(question.when({ addStylelint: false, codeStyle: 'godaddy' })).not.true();
  });

  it('stylelintConfig question transforms input for short names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][3];
    assume(question.name).equals('stylelintConfig');
    assume(question.transformer('short')).equals('stylelint-config-short');
  });

  it('stylelintConfig question does not transform for scoped names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.getCall(0).args[0][3];
    assume(question.name).equals('stylelintConfig');
    assume(question.transformer('@scope/config')).equals('@scope/config');
  });
});
