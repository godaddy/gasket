const promptHook = require('../lib/prompt');

describe('promptHook', () => {
  let mockGasket, mockCreateContext, prompt, mockAnswers;

  beforeEach(function () {
    mockGasket = {};
    mockCreateContext = {};
    mockAnswers = { useGasketIntl: true  };
    prompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  it('sets hasGasketIntl to true', async () => {
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(prompt).toHaveBeenCalled();
    expect(result.hasGasketIntl).toEqual(true);
  });

  it('sets hasGasketIntl to false', async () => {
    mockAnswers.useGasketIntl = false;
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(prompt).toHaveBeenCalled();
    expect(result.hasGasketIntl).toEqual(false);
  });

  it('does not prompt if hasGasketIntl is set', async () => {
    mockCreateContext.hasGasketIntl = false;
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    expect(result.hasGasketIntl).toEqual(mockCreateContext.hasGasketIntl);
  });

  it('does not prompt if useAppRouter is true', async () => {
    mockCreateContext.useAppRouter = true;
    const result = await promptHook(mockGasket, mockCreateContext, { prompt });
    expect(prompt).not.toHaveBeenCalled();
    expect(result.hasGasketIntl).toEqual(mockCreateContext.hasGasketIntl);
  });
});
