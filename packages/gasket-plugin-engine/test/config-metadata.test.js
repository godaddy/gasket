const PluginEngine = require('../lib/engine');

describe('PluginEngine', () => {
  it('includes metadata.plugins into the config', async () => {
    const engine = new PluginEngine();
    await engine.exec('init');

    await engine.exec('foo');

    expect(engine.config.metadata.presets).toBe({});
    expect(engine.config.metadata.plugins).toBe({});
  });
});
