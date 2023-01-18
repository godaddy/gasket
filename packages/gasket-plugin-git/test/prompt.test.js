const prompt = require('../lib/prompt');

describe('prompt', function () {
  let mockContext, mockUtils, promptStub;

  beforeEach(() => {
    promptStub = jest.fn();

    mockContext = {
      appName: 'bogus-app'
    };
    mockUtils = {
      prompt: promptStub
    };
  });

  it('is async function', function () {
    expect(prompt).toEqual(expect.any(Function));
  });

  it('does not prompt if gitInit set in context', async () => {
    mockContext.gitInit = false;
    await prompt({}, mockContext, mockUtils);

    // eslint-disable-next-line require-atomic-updates
    mockContext.gitInit = true;
    await prompt({}, mockContext, mockUtils);

    expect(promptStub).not.toHaveBeenCalled();
    expect(typeof mockContext.gitignore).toBe('object');
  });

  it('prompts if gitInit not set in context', async () => {
    promptStub.mockReturnValue({ gitInit: true });
    await prompt({}, mockContext, mockUtils);

    expect(promptStub).toHaveBeenCalled();
    expect(promptStub.mock.calls[0][0][0]).toHaveProperty('name', 'gitInit');
  });

  it('sets gitInit in updated context', async () => {
    promptStub.mockReturnValue({ gitInit: true });
    const result = await prompt({}, mockContext, mockUtils);

    expect(result).not.toEqual(mockContext);
    expect(result).toHaveProperty('gitInit', true);
  });

  it('returns original context if no prompt', async () => {
    mockContext.gitInit = true;
    const result = await prompt({}, mockContext, mockUtils);

    expect(result).toEqual(mockContext);
  });

  it('serializes gitignore content', async () => {
    mockContext.gitInit = true;
    await prompt({}, mockContext, mockUtils);

    expect(typeof mockContext.gitignore.content).toBe('string');
  });
});
