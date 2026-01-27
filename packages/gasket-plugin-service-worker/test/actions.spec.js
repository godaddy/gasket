import { vi } from 'vitest';

vi.mock('../lib/utils/utils.js', () => ({
  loadRegisterScript: vi.fn()
}));

import actions from '../lib/actions.js';
import * as utils from '../lib/utils/utils.js';

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
      execWaterfall: vi.fn()
    };
    mockReq = {
      path: '/some/page'
    };
  });

  describe('getSWRegisterScript', () => {
    it('attaches swRegisterScript to req', async () => {
      const swScript = await actions.getSWRegisterScript(mockGasket, mockReq);
      expect(swScript).toContain(mockRegisterScript);
    });
  });
});
