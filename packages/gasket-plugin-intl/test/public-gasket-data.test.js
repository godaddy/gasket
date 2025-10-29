import publicGasketData from '../lib/public-gasket-data.js';

describe('publicGasketData', () => {
  let mockGasket, mockData, mockReq;

  beforeEach(() => {
    mockGasket = {
      actions: {
        getIntlLocale: vi.fn().mockResolvedValue('fr-FR')
      }
    };

    mockData = {};
    mockReq = {};
  });

  it('calls intlLocale action', async () => {
    await publicGasketData(mockGasket, mockData, { req: mockReq });
    expect(mockGasket.actions.getIntlLocale).toHaveBeenCalledWith(mockReq);
  });

  it('updates the public gasket data', async () => {
    const results = await publicGasketData(mockGasket, mockData, { req: mockReq });
    expect(results).toEqual(expect.objectContaining({
      intl: expect.objectContaining({
        locale: 'fr-FR'
      })
    }));
  });
});
