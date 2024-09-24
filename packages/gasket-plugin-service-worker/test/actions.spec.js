const utils = require('../lib/utils/utils');
jest.mock('../lib/utils/utils');
const { getSWRegisterScript } = require('../lib/actions');

const mockRegisterScript = 'mock script';

describe('actions', () => {
  let mockGasket, mockConfig, mockReq;

  beforeEach(async () => {
    utils.loadRegisterScript.mockReturnValue(mockRegisterScript);
    mockConfig = {
      url: '/sw.js',
      scope: '/',
      content: ''
    };
    mockGasket = {
      config: {
        serviceWorker: mockConfig
      },
      execWaterfall: jest.fn()
    };
    mockReq = {
      path: '/some/page'
    };
  });

  describe('getSWRegisterScript', () => {
    it('attaches swRegisterScript to req', async () => {
      const swScript = await getSWRegisterScript(mockGasket, mockReq);
      expect(swScript).toContain(mockRegisterScript);
    });
  });
});
