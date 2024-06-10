describe('prompt hook', () => {
  let gasket, context, prompt, mockAnswers;
  const plugin = require('../lib/');
  const promptHook = plugin.hooks.prompt;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { useAppRouter: false, addSitemap: true, nextServerType: 'next-cli' };
    prompt = jest.fn().mockImplementation(() => mockAnswers);
  });

  it('prompts', async () => {
    await promptHook(gasket, context, { prompt });
    expect(prompt).toHaveBeenCalled();
  });

  it('serves the expected prompt question', async () => {
    await promptHook(gasket, context, { prompt });
    const first = prompt.mock.calls[0][0][0];
    const second = prompt.mock.calls[1][0][0];
    const third = prompt.mock.calls[2][0][0];
    expect(first.name).toEqual('useAppRouter');
    expect(first.message).toEqual('Do you want to use the App Router? (experimental)');
    expect(first.type).toEqual('confirm');
    expect(second.name).toEqual('nextServerType');
    expect(second.message).toEqual('Which server type would you like to use?');
    expect(second.type).toEqual('list');
    expect(third.name).toEqual('addSitemap');
    expect(third.message).toEqual('Do you want to add a sitemap?');
    expect(third.type).toEqual('confirm');
  });

  it('sets nextServerType to next-cli', async () => {
    const result = await promptHook(gasket, context, { prompt });
    expect(result.nextServerType).toEqual('next-cli');
  });

  it('sets nextServerType to next-custom', async () => {
    mockAnswers = { nextServerType: 'next-custom' };
    const result = await promptHook(gasket, context, { prompt });
    expect(result.nextServerType).toEqual('next-custom');
  });

  it('sets addSitemap to true', async () => {
    const result = await promptHook(gasket, context, { prompt });
    expect(result.addSitemap).toEqual(true);
  });

  it('sets addSitemap to false', async () => {
    mockAnswers = { addSitemap: false };
    const result = await promptHook(gasket, context, { prompt });
    expect(result.addSitemap).toEqual(false);
  });

  it('sets useAppRouter to true', async () => {
    mockAnswers = { useAppRouter: true };
    const result = await promptHook(gasket, context, { prompt });
    expect(result.useAppRouter).toEqual(true);
  });

  it('does not run prompt if prompts are in context', async () => {
    context.addSitemap = false;
    context.nextServerType = false;
    context.useAppRouter = false;
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toHaveProperty('addSitemap', false);
    expect(prompt).not.toHaveBeenCalled();
  });
});
