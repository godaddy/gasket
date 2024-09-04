const configure = require('../lib/configure');


const { baseDataMap } = require('../lib/actions');

jest.spyOn(baseDataMap, 'set');


describe('configure hook', () => {
  let gasket, config;
  beforeEach(() => {
    gasket = {
      symbol: Symbol('gasket'),
      command: {
        id: 'commandId'
      },
      config: {
        env: 'test',
        root: 'root'
      }
    };
    config = {
      data: {
        some: 'data'
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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
