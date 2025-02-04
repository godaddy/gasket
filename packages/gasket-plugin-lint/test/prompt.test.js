const promptHook = require('../lib').hooks.prompt;
const codeStyles = require('../lib/code-styles');

describe('prompt hook', function () {
  let gasket, context, prompt, mockAnswers;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { codeStyle: 'godaddy' };
    prompt = jest.fn().mockResolvedValue(mockAnswers);
  });

  it('prompts the user', async () => {
    await promptHook(gasket, context, { prompt });
    expect(prompt).toHaveBeenCalled();
  });

  it('does not prompt if lint settings exist', async () => {
    await promptHook(gasket, { codeStyle: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    await promptHook(gasket, { eslintConfig: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    await promptHook(gasket, { stylelintConfig: 'godaddy' }, { prompt });
    expect(prompt).not.toHaveBeenCalled();
  });

  it('returns unmodified context if no prompts occur', async () => {
    context = { codeStyle: 'godaddy' };
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toEqual(context);
  });

  it('returns modified context with prompt answers', async () => {
    context = { bogus: true };
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toEqual({ ...context, ...mockAnswers });
  });

  it('codeStyle question presents expected choices', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][0];
    expect(question.name).toEqual('codeStyle');
    expect(question.choices).toHaveLength(
      Object.keys(codeStyles).filter((name) => name !== 'common').length
    );
    expect(question.choices.map((c) => c.value)).toEqual(
      Object.keys(codeStyles).filter((name) => name !== 'common')
    );
  });

  it('addStylelint question appears only when codeStyle supports it', async () => {
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][1];
    expect(question.name).toEqual('addStylelint');

    expect(question.when({ codeStyle: 'godaddy' })).toBe(true);
    expect(question.when({ codeStyle: 'standard' }) || false).toBe(false); // Fix: Ensure false default
  });


  it('addStylelint question is skipped when apiApp is true', async () => {
    context.apiApp = true;
    await promptHook(gasket, context, { prompt });
    const question = prompt.mock.calls[0][0][1];
    expect(question.name).toEqual('addStylelint');
    expect(question.when({ codeStyle: 'godaddy' })).toBe(false);
    expect(question.when({ codeStyle: 'standard' })).toBe(false);
  });
});
