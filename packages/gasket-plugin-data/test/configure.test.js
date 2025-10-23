import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import configure from '../lib/configure.js';
import { baseDataMap } from '../lib/actions.js';

describe('configure hook', () => {
  let gasket, config;

  beforeEach(() => {
    vi.spyOn(baseDataMap, 'set');

    gasket = {
      symbol: Symbol('gasket'),
      config: {
        env: 'test',
        root: 'root',
        command: 'commandId'
      }
    };
    config = {
      data: {
        some: 'data'
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes data definition for config object', () => {
    const results = configure(gasket, config);

    expect(results).not.toHaveProperty('data');
  });

  it('stores data in action map', () => {
    configure(gasket, config);

    expect(baseDataMap.set).toHaveBeenCalledWith(gasket.symbol, { some: 'data' });
  });

  it('stored data has overrides applied', () => {
    config.data = {
      some: 'data',
      environments: {
        test: {
          some: 'override'
        }
      }
    };

    configure(gasket, config);

    expect(baseDataMap.set).toHaveBeenCalledWith(gasket.symbol, { some: 'override' });
  });
});
