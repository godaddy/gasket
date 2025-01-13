const promptHook = require('../lib/prompt');

describe('promptHook', () => {
  let gasket, context, prompt;

  beforeEach(() => {
    gasket = {};
    prompt = jest.fn();
  });

  test('should not prompt if context already has typescript', async () => {
    context = { typescript: true };

    await promptHook(gasket, context, { prompt });

    expect(prompt).not.toHaveBeenCalled();
  });

  test('should prompt and return updated context when typescript is not in context', async () => {
    context = {};

    prompt.mockResolvedValueOnce({ typescript: true });

    const result = await promptHook(gasket, context, { prompt });

    expect(prompt).toHaveBeenCalledWith([
      {
        name: 'typescript',
        message: 'Do you want to use TypeScript?',
        type: 'confirm',
        default: false
      }
    ]);
    expect(result).toEqual({ typescript: true });
  });

  test('should return context unchanged if user selects default (false)', async () => {
    context = {};

    prompt.mockResolvedValueOnce({ typescript: false });

    const result = await promptHook(gasket, context, { prompt });

    expect(prompt).toHaveBeenCalled();
    expect(result).toEqual({ typescript: false });
  });
});
