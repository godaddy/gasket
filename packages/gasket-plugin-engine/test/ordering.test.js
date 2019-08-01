const mapObject = require('./map-object');

describe('Plugin hook ordering', () => {
  it('enables a plugin to specify it runs before another', () => {
    return verify({
      withOrderingSpecs: {
        a: { before: ['c'] },
        b: { before: ['a'] },
        c: null
      },
      expectOrder: ['b', 'a', 'c']
    });
  });

  it('enables a plugin to specify it runs after another', () => {
    return verify({
      withOrderingSpecs: {
        a: { after: ['c'] },
        b: null,
        c: { after: ['b'] }
      },
      expectOrder: ['b', 'c', 'a']
    });
  });

  it('enables a plugin to specify it runs between others another', () => {
    return verify({
      withOrderingSpecs: {
        a: null,
        b: null,
        c: { after: ['b'], before: ['a'] }
      },
      expectOrder: ['b', 'c', 'a']
    });
  });

  it('can specify multiple plugins in before/after spec', () => {
    return verify({
      withOrderingSpecs: {
        a: null,
        b: null,
        c: null,
        d: { after: ['e', 'a'], before: ['b', 'c'] },
        e: null
      },
      expectOrder: ['a', 'e', 'd', 'b', 'c']
    });
  });

  it('enables a plugin declaring it should be first', () => {
    return verify({
      withOrderingSpecs: {
        a: null,
        b: null,
        c: { first: true }
      },
      expectOrder: ['c', 'a', 'b']
    });
  });

  it('enables a plugin declaring it should be last', () => {
    return verify({
      withOrderingSpecs: {
        a: { last: true },
        b: null,
        c: null
      },
      expectOrder: ['b', 'c', 'a']
    });
  });

  it('throws an error if ordering is impossible (direct cycle)', () => {
    return verify({
      withOrderingSpecs: {
        a: { before: ['b'] },
        b: { before: ['a'] },
        c: null
      },
      expectError: true
    });
  });

  it('throws an error if ordering is impossible (indirect cycle)', () => {
    return verify({
      withOrderingSpecs: {
        a: { after: ['c'] },
        b: { after: ['a'] },
        c: { after: ['b'] }
      },
      expectError: true
    });
  });

  describe('Hook event timing', () => {
    let PluginF, PluginG, PluginE;

    beforeEach(() => {
      PluginF = { hooks: { mockEvent: () => {} } };
      PluginG = { hooks: { mockEvent2: () => {} } };
      PluginE = { hooks: { mockEvent2: { timing: { before: ['f'], after: ['g'] }, handler: () => {} } } };

      jest
        .doMock('@gasket/f-plugin', () => PluginF, { virtual: true })
        .doMock('@gasket/g-plugin', () => PluginG, { virtual: true })
        .doMock('@gasket/e-plugin', () => PluginE, { virtual: true });
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('warns if plugin has bad before timing', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      const PluginEngine = require('..');
      const engine = new PluginEngine({
        plugins: {
          add: ['f', 'g', 'e']
        }
      });

      await engine.exec('mockEvent2');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('if timing correct, no errors', async () => {
      const PluginEngine = require('..');
      const engine = new PluginEngine({
        plugins: {
          add: ['f', 'g']
        }
      });

      await engine.exec('mockEvent2');
    });
  });

  async function verify({ withOrderingSpecs, expectOrder, expectError }) {
    jest.resetModules();

    const modules = mapObject(withOrderingSpecs, (timing, key) => ({
      hooks: {
        event: {
          timing,
          handler: () => key
        }
      }
    }));

    Object
      .entries(modules)
      .forEach(([name, module]) => {
        jest.doMock(`@gasket/${name}-plugin`, () => module, { virtual: true });
      });

    const PluginEngine = require('..');
    const engine = new PluginEngine({
      plugins: {
        add: Object.keys(withOrderingSpecs)
      }
    });

    try {
      const results = await engine.exec('event');
      expect(results).toEqual(expectOrder);
    } catch (err) {
      if (!expectError) {
        throw err;
      }
    }
  }
});
