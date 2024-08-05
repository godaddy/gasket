/** @jest-environment jsdom */ // eslint-disable-line

import { jest } from '@jest/globals';

const mockGasketData = jest.fn();
jest.unstable_mockModule('../lib/gasket-data.js', () => ({ gasketData: mockGasketData }));

describe('resolveGasketData', () => {
  let mockGasket;
  const mockReq = {};

  beforeEach(() => {
    mockGasketData.mockResolvedValue({ test: 'hello world' });
    mockGasket = { actions: { getPublicGasketData: jest.fn() } };
  });

  it('should call gasketData in browser', async () => {
    const { resolveGasketData } = await import('../lib/resolve-gasket-data.js');
    const results = await resolveGasketData(mockGasket, mockReq);

    expect(mockGasketData).toHaveBeenCalled();
    expect(results).toEqual({ test: 'hello world' });
  });

  it('should not call gasket.actions.getPublicGasketData in browser', async () => {
    const { resolveGasketData } = await import('../lib/resolve-gasket-data.js');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasket.actions.getPublicGasketData).not.toHaveBeenCalled();
  });
});
