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
    beforeEach(() => {
      let PluginA, PluginB;

      PluginA = { name: 'a', hooks: { mockEventA: jest.fn() } };
      PluginB = { name: 'a', hooks: { mockEventB: jest.fn() } };
      jest
        .doMock('@gasket/a-plugin', () => PluginA, { virtual: true })
        .doMock('@gasket/b-plugin', () => PluginB, { virtual: true });
    });

    it('throws an error if plugin has bad hook timming config', async () => {
      return verify({
        withOrderingSpecs: {
          mockEventB: { before: ['a'], after: ['b'] }
        },
        expectOrder: ['mockEventB'],
        expectError: true
      });
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
