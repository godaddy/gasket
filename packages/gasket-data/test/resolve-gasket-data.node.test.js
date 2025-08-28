/** @jest-environment node */


const mockGasketData = vi.fn();
vi.mock('../lib/gasket-data.js', () => ({ gasketData: mockGasketData }));

describe('resolveGasketData', () => {
  let mockGasket;
  const mockReq = {};

  beforeEach(() => {
    mockGasketData.mockResolvedValue({ test: 'hello world' });
    mockGasket = { actions: { getPublicGasketData: vi.fn() } };
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
