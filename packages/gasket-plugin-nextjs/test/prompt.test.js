const {
  prompt,
  promptAppRouter,
  promptNextServerType,
  promptNextDevProxy,
  promptSitemap
} = require('../lib/prompt');

describe('prompt hook', () => {
  let gasket, context, mockPrompt, mockAnswers;
  const promptHook = prompt;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { useAppRouter: false, addSitemap: true, nextServerType: 'next-cli' };
    mockPrompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prompts', async () => {
    await promptHook(gasket, context, { prompt: mockPrompt });
    expect(mockPrompt).toHaveBeenCalled();
  });

  it('serves the expected prompt question', async () => {
    await promptHook(gasket, context, { prompt: mockPrompt });
    const first = mockPrompt.mock.calls[0][0][0];
    const second = mockPrompt.mock.calls[1][0][0];
    const third = mockPrompt.mock.calls[2][0][0];
    const fourth = mockPrompt.mock.calls[3][0][0];
    expect(first.name).toEqual('useAppRouter');
    expect(first.message).toEqual('Do you want to use the App Router? (experimental)');
    expect(first.type).toEqual('confirm');
    expect(second.name).toEqual('nextServerType');
    expect(second.message).toEqual('Which server type would you like to use?');
    expect(second.type).toEqual('list');
    expect(third.name).toEqual('nextDevProxy');
    expect(third.message).toEqual('Do you want to add a proxy for the Next.js dev server?');
    expect(third.type).toEqual('confirm');
    expect(fourth.name).toEqual('addSitemap');
    expect(fourth.message).toEqual('Do you want to add a sitemap?');
    expect(fourth.type).toEqual('confirm');
  });

  it('sets nextServerType to next-cli', async () => {
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.nextServerType).toEqual('next-cli');
  });

  it('sets nextServerType to next-custom', async () => {
    mockAnswers = { nextServerType: 'next-custom' };
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.nextServerType).toEqual('next-custom');
  });

  it('sets addSitemap to true', async () => {
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.addSitemap).toEqual(true);
  });

  it('sets addSitemap to false', async () => {
    mockAnswers = { addSitemap: false };
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.addSitemap).toEqual(false);
  });

  it('sets useAppRouter to true', async () => {
    mockAnswers = { useAppRouter: true };
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.useAppRouter).toEqual(true);
  });

  it('does not run prompt if prompts are in context', async () => {
    context.addSitemap = false;
    context.nextServerType = false;
    context.useAppRouter = false;
    context.nextDevProxy = false;
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result).toHaveProperty('addSitemap', false);
    expect(mockPrompt).not.toHaveBeenCalled();
  });

  describe('prompt exports', () => {
    it('promptAppRouter', async () => {
      await promptAppRouter(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([{
        name: 'useAppRouter',
        message: 'Do you want to use the App Router? (experimental)',
        type: 'confirm',
        default: false
      }]);
    });

    it('promptNextServerType', async () => {
      await promptNextServerType(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          name: 'nextServerType',
          message: 'Which server type would you like to use?',
          type: 'list',
          choices: [
            { name: 'Next Server(CLI)', value: 'defaultServer' },
            { name: 'Custom Next Server', value: 'customServer' }
          ]
        }
      ]);
    });

    it('promptNextDevProxy', async () => {
      await promptNextDevProxy(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          name: 'nextDevProxy',
          message: 'Do you want to add a proxy for the Next.js dev server?',
          type: 'confirm',
          default: false
        }
      ]);
    });

    it('promptSitemap', async () => {
      await promptSitemap(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          name: 'addSitemap',
          message: 'Do you want to add a sitemap?',
          type: 'confirm',
          default: false
        }
      ]);
    });
  });
});
