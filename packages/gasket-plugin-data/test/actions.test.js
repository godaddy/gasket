const { actions, baseDataMap } = require('../lib/actions');

describe('actions hook', () => {
  let gasket;

  beforeEach(() => {
    gasket = {
      execWaterfall: jest.fn().mockImplementation((event, config) => config)
    };
  });

  it('returns expected actions', () => {
    const results = actions(gasket);

    const expected = [
      'getGasketData',
      'getPublicGasketData'
    ];

    expect(Object.keys(results)).toEqual(expected);
  });

  describe('getGasketData', () => {
    let getGasketData;

    beforeEach(() => {
      gasket.actions = actions(gasket);
      getGasketData = gasket.actions.getGasketData;
    });

    it('returns base data', async () => {
      baseDataMap.set(gasket, { some: 'data' });

      const results = await getGasketData();
      expect(results).toEqual({ some: 'data' });
    });

    it('returns adjusted data by gasketData lifecycle', async () => {
      baseDataMap.set(gasket, { some: 'data' });
      gasket.execWaterfall.mockResolvedValue({ some: 'adjusted' });

      const results = await getGasketData();

      expect(gasket.execWaterfall).toHaveBeenCalledWith('gasketData', { some: 'data' });
      expect(results).toEqual({ some: 'adjusted' });
    });

    it('only executes gasketData fixup once', async () => {
      baseDataMap.set(gasket, { some: 'data' });

      const results1 = await getGasketData();
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      const results2 = await getGasketData();
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      expect(results1).toBe(results2);
    });

    it('throws if undefined lifecycle result', async () => {
      baseDataMap.set(gasket, { some: 'data' });

      gasket.execWaterfall.mockResolvedValue();

      await expect(() => getGasketData())
        .rejects.toThrow('No gasketData - likely a gasketData lifecycle hook did not properly return data.');
    });

    it('clears baseDataMap once adjusted', async () => {
      baseDataMap.set(gasket, { some: 'data' });

      expect(baseDataMap.has(gasket)).toBe(true);
      await getGasketData();
      expect(baseDataMap.has(gasket)).not.toBe(true);
    });
  });

  describe('getPublicGasketData', () => {
    let getGasketData, getPublicGasketData, req;

    beforeEach(() => {
      gasket.actions = actions(gasket);
      getGasketData = jest.spyOn(gasket.actions, 'getGasketData').mockResolvedValue({ some: 'data' });
      getPublicGasketData = gasket.actions.getPublicGasketData;
      req = { mock: 'request' };
    });

    it('returns public from gasketData', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });

      const results = await getPublicGasketData(req);
      expect(getGasketData).toHaveBeenCalled();
      expect(results).toEqual({ some: 'data' });
    });

    it('returns empty object if no gasketData.public', async () => {
      getGasketData.mockResolvedValue({ private: 'stuff' });

      const results = await getPublicGasketData(req);
      expect(getGasketData).toHaveBeenCalled();
      expect(results).toEqual({});
    });

    it('does not include non-public data', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' }, private: 'stuff' });

      const results = await getPublicGasketData(req);
      expect(results).toEqual({ some: 'data' });
    });

    it('returns adjusted data by publicGasketData lifecycle', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });
      gasket.execWaterfall.mockResolvedValue({ some: 'adjusted' });

      const results = await getPublicGasketData(req);

      expect(gasket.execWaterfall).toHaveBeenCalledWith('publicGasketData', { some: 'data' }, { req });
      expect(results).toEqual({ some: 'adjusted' });
    });

    it('throws if undefined lifecycle results', async () => {
      getGasketData.mockResolvedValue({ public: { some: 'data' } });
      gasket.execWaterfall.mockResolvedValue();

      await expect(() => getPublicGasketData(req))
        .rejects.toThrow('No public gasketData - likely a publicGasketData lifecycle hook did not properly return data.');
    });

    it('only executes publicGasketData fixup once per request', async () => {
      baseDataMap.set(gasket, { some: 'data' });

      const results1 = await getPublicGasketData(req);
      expect(getGasketData).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      const results2 = await getPublicGasketData(req);
      expect(getGasketData).toHaveBeenCalledTimes(1);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(1);

      expect(results1).toBe(results2);

      const newReq = {};
      const results3 = await getPublicGasketData(newReq);
      expect(getGasketData).toHaveBeenCalledTimes(2);
      expect(gasket.execWaterfall).toHaveBeenCalledTimes(2);

      // ok to look the same
      expect(results2).toEqual(results3);
      // NOT ok to be the same
      expect(results2).not.toBe(results3);
    });
  });
});
