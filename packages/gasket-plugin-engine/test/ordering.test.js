function setupLoadedPlugins(withOrderingSpecs) {
  return Object.entries(withOrderingSpecs).map(([name, timing]) => ({
    module: {
      name,
      hooks: {
        event: {
          timing,
          handler: () => name
        }
      }
    }
  }));
}

function setupEngine(plugins) {
  const { Loader } = require('@gasket/resolve');
  jest.spyOn(Loader.prototype, 'loadConfigured').mockImplementation(() => {
    return {
      plugins
    };
  });

  const PluginEngine = require('..');
  return new PluginEngine({});
}

async function verify({ withOrderingSpecs, expectOrder, expectError }) {
  const plugins = setupLoadedPlugins(withOrderingSpecs);
  const engine = setupEngine(plugins);

  try {
    const results = await engine.exec('event');
    expect(results).toEqual(expectOrder);
  } catch (err) {
    if (!expectError) {
      throw err;
    }
  }
}

describe('Plugin hook ordering', () => {

  it('enables a plugin to specify it runs before another', () => {
    return verify({
      withOrderingSpecs: {
        testa: { before: ['testc'] },
        testb: { before: ['testa'] },
        testc: null
      },
      expectOrder: ['testb', 'testa', 'testc']
    });
  });

  it('enables a plugin to specify it runs after another', () => {
    return verify({
      withOrderingSpecs: {
        testa: { after: ['testc'] },
        testb: null,
        testc: { after: ['testb'] }
      },
      expectOrder: ['testb', 'testc', 'testa']
    });
  });

  it('enables a plugin to specify it runs between others another', () => {
    return verify({
      withOrderingSpecs: {
        testa: null,
        testb: null,
        testc: { after: ['testb'], before: ['testa'] }
      },
      expectOrder: ['testb', 'testc', 'testa']
    });
  });

  it('can specify multiple plugins in before/after spec', () => {
    return verify({
      withOrderingSpecs: {
        testa: null,
        testb: null,
        testc: null,
        testd: { after: ['teste', 'testa'], before: ['testb', 'testc'] },
        teste: null
      },
      expectOrder: ['testa', 'teste', 'testd', 'testb', 'testc']
    });
  });

  it('enables a plugin declaring it should be first', () => {
    return verify({
      withOrderingSpecs: {
        testa: null,
        testb: null,
        testc: { first: true }
      },
      expectOrder: ['testc', 'testa', 'testb']
    });
  });

  it('enables a plugin declaring it should be last', () => {
    return verify({
      withOrderingSpecs: {
        testa: { last: true },
        testb: null,
        testc: null
      },
      expectOrder: ['testb', 'testc', 'testa']
    });
  });

  it('throws an error if ordering is impossible (direct cycle)', () => {
    return verify({
      withOrderingSpecs: {
        testa: { before: ['testb'] },
        testb: { before: ['testa'] },
        testc: null
      },
      expectError: true
    });
  });

  it('throws an error if ordering is impossible (indirect cycle)', () => {
    return verify({
      withOrderingSpecs: {
        testa: { after: ['testc'] },
        testb: { after: ['testa'] },
        testc: { after: ['testb'] }
      },
      expectError: true
    });
  });

  it('warns if plugin has bad before timing', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    const plugins = setupLoadedPlugins({
      testa: null,
      testb: null,
      testc: { before: ['testa'], after: ['testb'] }
    });

    await setupEngine(plugins).exec('event');

    expect(spy).toHaveBeenCalledTimes(0);

    // change the name of the hook for first module and try again

    const mod = plugins[0].module;
    mod.hooks.event2 = mod.hooks.event;
    delete mod.hooks.event;

    await setupEngine(plugins).exec('event');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
