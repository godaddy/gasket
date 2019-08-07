const mapObject = require('./map-object');

describe('Plugin hook ordering', () => {

  let PluginEngine;

  beforeEach(() => {
    PluginEngine = require('..');
    jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
      return `/root/node_modules/${arg}`;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  describe('Hook event timing', () => {
    let PluginF, PluginG, PluginE;

    beforeEach(() => {
      PluginF = { hooks: { mockEvent: () => {} } };
      PluginG = { hooks: { mockEvent2: () => {} } };
      PluginE = { hooks: { mockEvent2: { timing: { before: ['testf'], after: ['testg'] }, handler: () => {} } } };

      jest
        .doMock('@gasket/testf-plugin', () => PluginF, { virtual: true })
        .doMock('@gasket/testg-plugin', () => PluginG, { virtual: true })
        .doMock('@gasket/teste-plugin', () => PluginE, { virtual: true });

      PluginEngine = require('..');
      jest.spyOn(PluginEngine.prototype, '_resolveModulePath').mockImplementation(arg => {
        return `/root/node_modules/${arg}`;
      });
    });

    afterEach(() => {
      jest.resetModules();
      jest.restoreAllMocks();
    });

    it('warns if plugin has bad before timing', async () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation();
      const engine = new PluginEngine({
        plugins: {
          add: ['testf', 'testg', 'teste']
        }
      });

      await engine.exec('mockEvent2');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('if timing correct, no errors', async () => {
      const engine = new PluginEngine({
        plugins: {
          add: ['testf', 'testg']
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
