const promptHook = require('../lib/prompt');

describe('promptSwagger', () => {
  let context, gasket, mockPrompt, mockAnswers;

  beforeEach(() => {
    context = {};
    gasket = {};
    mockAnswers = { useSwagger: false };
    mockPrompt = jest.fn().mockResolvedValue(mockAnswers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets useSwagger to false', async () => {
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.useSwagger).toEqual(false);
  });

  it('calls prompt with correct arguments', async () => {
    await promptHook(gasket, context, { prompt: mockPrompt });
    expect(mockPrompt).toHaveBeenCalledWith([
      {
        name: 'useSwagger',
        message: 'Do you want to use Swagger?',
        type: 'confirm',
        default: true
      }
    ]);
  });

  it('does not prompt if useSwagger exists in context', async () => {
    context.useSwagger = true;
    const result = await promptHook(gasket, context, { prompt: mockPrompt });

    // Ensure the existing value is returned without calling prompt
    expect(result.useSwagger).toEqual(true);
    expect(mockPrompt).not.toHaveBeenCalled();
  });
});
