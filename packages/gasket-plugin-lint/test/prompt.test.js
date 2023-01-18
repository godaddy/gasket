const promptHook = require('../lib').hooks.prompt;
const codeStyles = require('../lib/code-styles');

describe('prompt hook', function () {
  let gasket, context, prompt, mockAnswers;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { codeStyle: 'godaddy' };
    prompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  it('prompts', async () => {
    await promptHook(gasket, context, { prompt });
    expect(prompt).toHaveBeenCalled();
  });

  it('does not prompt if lint settings detected', async () => {
    await promptHook(gasket, { codeStyle: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    await promptHook(gasket, { eslintConfig: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    await promptHook(gasket, { stylelintConfig: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
  });

  it('returns unmodified context if no prompts', async () => {
    context = { codeStyle: 'godaddy' };
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toEqual(context);
  });

  it('returns modified context with prompt answers', async () => {
    context = { bogus: true };
    const result = await promptHook(gasket, context, { prompt });
    expect(result).not.toEqual(context);
    expect(result).toEqual({ ...context, ...mockAnswers });
  });

  it('codeStyle question shown presents expected choices', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][0];
    expect(question.name).toEqual('codeStyle');
    expect(question.choices).toHaveLength(Object.keys(codeStyles).length - 1);
    expect(question.choices.map(c => c.value)).toEqual(Object.keys(codeStyles).filter(name => name !== 'common'));
  });

  it('eslintConfig question shown when codeStyle is `other`', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][1];
    expect(question.name).toEqual('eslintConfig');
    expect(question.when({ codeStyle: 'other' })).toBe(true);
    expect(question.when({ codeStyle: 'godaddy' })).not.toBe(true);
    expect(question.when({ codeStyle: 'standard' })).not.toBe(true);
    expect(question.when({ codeStyle: 'none' })).not.toBe(true);
  });

  it('eslintConfig question transforms input for short names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][1];
    expect(question.name).toEqual('eslintConfig');
    expect(question.transformer('short')).toEqual('eslint-config-short');
  });

  it('eslintConfig question does not transform for scoped names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][1];
    expect(question.name).toEqual('eslintConfig');
    expect(question.transformer('@scope/config')).toEqual('@scope/config');
    expect(question.transformer('@scope')).toEqual('@scope');
  });

  it('addStylelint question shown only codeStyle has support', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][2];
    expect(question.name).toEqual('addStylelint');
    expect(question.when({ codeStyle: 'other' })).toBe(true);
    expect(question.when({ codeStyle: 'godaddy' })).toBe(true);
    expect(question.when({ codeStyle: 'standard' })).not.toBe(true);
  });

  it('stylelintConfig question shown when codeStyle is `other`', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][3];
    expect(question.name).toEqual('stylelintConfig');
    expect(question.when({ addStylelint: true, codeStyle: 'other' })).toBe(true);
    expect(question.when({ addStylelint: true, codeStyle: 'godaddy' })).not.toBe(true);
  });

  it('stylelintConfig question not shown if addStylelint=false', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][3];
    expect(question.name).toEqual('stylelintConfig');
    expect(question.when({ addStylelint: false, codeStyle: 'other' })).not.toBe(true);
    expect(question.when({ addStylelint: false, codeStyle: 'godaddy' })).not.toBe(true);
  });

  it('stylelintConfig question transforms input for short names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][3];
    expect(question.name).toEqual('stylelintConfig');
    expect(question.transformer('short')).toEqual('stylelint-config-short');
  });

  it('stylelintConfig question does not transform for scoped names', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][3];
    expect(question.name).toEqual('stylelintConfig');
    expect(question.transformer('@scope/config')).toEqual('@scope/config');
    expect(question.transformer('@scope')).toEqual('@scope');
  });
});
