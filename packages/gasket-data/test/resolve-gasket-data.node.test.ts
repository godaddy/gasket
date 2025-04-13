import { describe, it, beforeEach, vi, expect } from 'vitest';

const mockGasketData = vi.fn();

// Vitest mock for ESM import
vi.mock('../src/gasket-data', () => ({
  gasketData: mockGasketData
}));

describe('resolveGasketData', () => {
  let mockGasket: any;
  const mockReq = {};

  beforeEach(() => {
    mockGasketData.mockResolvedValue({ test: 'hello world' });
    mockGasket = {
      actions: {
        getPublicGasketData: vi.fn()
      }
    };
  });

  it('should not call gasketData on server', async () => {
    const { resolveGasketData } = await import('../src/resolve-gasket-data');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasketData).not.toHaveBeenCalled();
  });

  it('should call gasket.actions.getPublicGasketData on server', async () => {
    const { resolveGasketData } = await import('../src/resolve-gasket-data');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasket.actions.getPublicGasketData).toHaveBeenCalledWith(mockReq);
  });
});
