const { actions, baseDataMap } = require('../lib/actions');
const { GasketRequest } = require('@gasket/request');

describe('actions', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      symbol: Symbol('gasket'),
      execWaterfall: jest.fn().mockImplementation((event, config) => config),
      actions
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns expected actions', () => {
    const expected = [
      'getGasketData',
      'getPublicGasketData'
    ];

    expect(Object.keys(actions)).toEqual(expected);
  });

  describe('getGasketData', () => {
    let getGasketData;

    beforeEach(() => {
      getGasketData = gasket.actions.getGasketData;
    });

    it('returns base data', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });

      const results = await getGasketData(gasket);
      expect(results).toEqual({ some: 'data' });
    });

    it('returns adjusted data by gasketData lifecycle', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });
      gasket.execWaterfall.mockResolvedValue({ some: 'adjusted' });

      const results = await getGasketData(gasket);

      expect(gasket.execWaterfall).toHaveBeenCalledWith('gasketData', { some: 'data' });
      expect(results).toEqual({ some: 'adjusted' });
    });

    it('only executes gasketData fixup once', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });

      const results1 = await getGasketData(gasket);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      const results2 = await getGasketData(gasket);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      expect(results1).toBe(results2);
    });

    it('throws if undefined lifecycle result', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });

      gasket.execWaterfall.mockResolvedValue();

      await expect(() => getGasketData(gasket))
        .rejects.toThrow('No gasketData - likely a gasketData lifecycle hook did not properly return data.');
    });

    it('clears baseDataMap once adjusted', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });

      expect(baseDataMap.has(gasket.symbol)).toBe(true);
      await getGasketData(gasket);
      expect(baseDataMap.has(gasket.symbol)).not.toBe(true);
    });
  });

  describe('getPublicGasketData', () => {
    let getGasketData, getPublicGasketData, req;

    beforeEach(() => {
      getGasketData = jest.spyOn(gasket.actions, 'getGasketData').mockResolvedValue({ some: 'data' });
      getPublicGasketData = gasket.actions.getPublicGasketData;
      req = { mock: 'request', headers: { 'x-example': 'example-data' } };
    });

    it('returns public from gasketData', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });

      const results = await getPublicGasketData(gasket, req);
      expect(getGasketData).toHaveBeenCalled();
      expect(results).toEqual({ some: 'data' });
    });

    it('returns empty object if no gasketData.public', async () => {
      getGasketData.mockResolvedValue({ private: 'stuff' });

      const results = await getPublicGasketData(gasket, req);
      expect(getGasketData).toHaveBeenCalled();
      expect(results).toEqual({});
    });

    it('does not include non-public data', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' }, private: 'stuff' });

      const results = await getPublicGasketData(gasket, req);
      expect(results).toEqual({ some: 'data' });
    });

    it('returns adjusted data by publicGasketData lifecycle', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });
      gasket.execWaterfall.mockResolvedValue({ some: 'adjusted' });

      const results = await getPublicGasketData(gasket, req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith('publicGasketData', { some: 'data' }, { req: expect.any(GasketRequest) });
      expect(results).toEqual({ some: 'adjusted' });
    });

    it('throws if undefined lifecycle results', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });
      gasket.execWaterfall.mockResolvedValue();

      await expect(() => getPublicGasketData(gasket, req))
        .rejects.toThrow('No public gasketData - likely a publicGasketData lifecycle hook did not properly return data.');
    });

    it('only executes publicGasketData fixup once per request', async () => {
      baseDataMap.set(gasket.symbol, { some: 'data' });

      const results1 = await getPublicGasketData(gasket, req);
      expect(getGasketData).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      const results2 = await getPublicGasketData(gasket, req);
      expect(getGasketData).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      expect(results1).toBe(results2);

      const newReq = { headers: { 'x-example': 'new-data' } };
      const results3 = await getPublicGasketData(gasket, newReq);
      expect(getGasketData).toHaveBeenCalledTimes(2);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(2);

      // ok to look the same
      expect(results2).toEqual(results3);
      // NOT ok to be the same
      expect(results2).not.toBe(results3);
    });
  });
});
