describe('prompt hook', () => {
  let gasket, context, prompt, mockAnswers;
  const plugin = require('../lib/');
  const promptHook = plugin.hooks.prompt;

  beforeEach(() => {
    gasket = {};
    context = {};
    mockAnswers = { addSitemap: true, useRedux: true,  nextServerType: 'next-cli' };
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
    const thrid = prompt.mock.calls[2][0][0];
    expect(first.name).toEqual('nextServerType');
    expect(first.message).toEqual('Which server type would you like to use?');
    expect(first.type).toEqual('list');
    expect(second.name).toEqual('addSitemap');
    expect(second.message).toEqual('Do you want to add a sitemap?');
    expect(second.type).toEqual('confirm');
    expect(thrid.name).toEqual('useRedux');
    expect(thrid.message).toEqual('Do you want to use Redux?');
    expect(thrid.type).toEqual('confirm');
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

  it('sets useRedux to true', async () => {
    const result = await promptHook(gasket, context, { prompt });
    expect(result.useRedux).toEqual(true);
  });

  it('sets useRedux to false', async () => {
    mockAnswers = { useRedux: false };
    const result = await promptHook(gasket, context, { prompt });
    expect(result.useRedux).toEqual(false);
  });

  it('does not run prompt if prompts are in context', async () => {
    context.addSitemap = false;
    context.nextServerType = false;
    context.useRedux = false;
    const result = await promptHook(gasket, context, { prompt });
    expect(result).toHaveProperty('addSitemap', false);
    expect(result).toHaveProperty('useRedux', false);
    expect(prompt).not.toHaveBeenCalled();
  });
});
