import { describe, it, beforeEach, expect, vi } from 'vitest';

const mockGasketData = vi.fn();

// Mock the gasket-data module
vi.mock('../src/gasket-data', () => ({
  gasketData: mockGasketData
}));

describe('resolveGasketData (browser)', () => {
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

  it('should call gasketData in browser', async () => {
    const { resolveGasketData } = await import('../src/resolve-gasket-data');
    const results = await resolveGasketData(mockGasket, mockReq);

    expect(mockGasketData).toHaveBeenCalled();
    expect(results).toEqual({ test: 'hello world' });
  });

  it('should not call gasket.actions.getPublicGasketData in browser', async () => {
    const { resolveGasketData } = await import('../src/resolve-gasket-data');
    await resolveGasketData(mockGasket, mockReq);

    expect(mockGasket.actions.getPublicGasketData).not.toHaveBeenCalled();
  });
});
