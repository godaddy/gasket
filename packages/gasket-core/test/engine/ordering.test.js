/* eslint-disable vitest/expect-expect */
const { Gasket }  = await import('../../lib/gasket.js');

/**
 *
 * @param withOrderingSpecs
 */
function setupLoadedPlugins(withOrderingSpecs) {
  return Object.entries(withOrderingSpecs).map(([name, timing]) => ({
    name,
    hooks: {
      event: {
        timing,
        handler: () => name
      }
    }
  }));
}

/**
 *
 * @param plugins
 */
function setupGasket(plugins) {
  return new Gasket({ plugins });
}

/**
 *
 * @param root0
 * @param root0.withOrderingSpecs
 * @param root0.expectOrder
 * @param root0.expectError
 */
async function verify({ withOrderingSpecs, expectOrder, expectError }) {
  const plugins = setupLoadedPlugins(withOrderingSpecs);
  const gasket = setupGasket(plugins);

  try {
    const results = await gasket.exec('event');
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
});
