/** @jest-environment node */ // eslint-disable-line

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

  it('should not call gasketData on server', async () => {
    const { resolveGasketData } = await import('../lib/resolve-gasket-data.js');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasketData).not.toHaveBeenCalled();
  });

  it('should call gasket.actions.getPublicGasketData on server', async () => {
    const { resolveGasketData } = await import('../lib/resolve-gasket-data.js');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasket.actions.getPublicGasketData).toHaveBeenCalledWith(mockReq);
  });
});
