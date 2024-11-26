const {
  prompt,
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
    const askNextServer = mockPrompt.mock.calls[0][0][0];
    const askDevServer = mockPrompt.mock.calls[1][0][0];
    const askSitemap = mockPrompt.mock.calls[2][0][0];
    expect(askNextServer.name).toEqual('nextServerType');
    expect(askNextServer.message).toEqual('Which server type would you like to use?');
    expect(askNextServer.type).toEqual('list');
    expect(askDevServer.name).toEqual('nextDevProxy');
    expect(askDevServer.message).toEqual('Do you want an HTTPS proxy for the Next.js server?');
    expect(askDevServer.type).toEqual('confirm');
    expect(askSitemap.name).toEqual('addSitemap');
    expect(askSitemap.message).toEqual('Do you want to add a sitemap?');
    expect(askSitemap.type).toEqual('confirm');
  });

  it('sets nextServerType to next-cli', async () => {
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.nextServerType).toEqual('next-cli');
  });

  it('sets nextServerType to customServer', async () => {
    mockAnswers = { nextServerType: 'customServer' };
    const result = await promptHook(gasket, context, { prompt: mockPrompt });
    expect(result.nextServerType).toEqual('customServer');
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
    mockAnswers = { nextServerType: 'appRouter' };
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

    it('promptNextServerType', async () => {
      await promptNextServerType(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          name: 'nextServerType',
          message: 'Which server type would you like to use?',
          type: 'list',
          choices: [
            { name: 'Page Router w/ Custom Server', value: 'customServer' },
            { name: 'Page Router', value: 'pageRouter' },
            { name: 'App Router', value: 'appRouter' }
          ]
        }
      ]);
    });

    it('promptNextDevProxy', async () => {
      await promptNextDevProxy(context, mockPrompt);
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          name: 'nextDevProxy',
          message: 'Do you want an HTTPS proxy for the Next.js server?',
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
