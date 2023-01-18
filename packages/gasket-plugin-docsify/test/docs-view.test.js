const mockDocsConfigSet = { docsRoot: '/path/to/app/.docs' };
const mockGenerateContentStub = jest.fn();
const mockServeStub = jest.fn();
const docsView = require('../lib/docs-view');

jest.mock('../lib//generate-content', () => mockGenerateContentStub);
jest.mock('@gasket/utils', () => ({ requireWithInstall: () => ({ serve: mockServeStub }) }));

describe('docsView', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      exec: jest.fn(),
      config: {}
    };
  });

  it('merges user config with expected defaults', async () => {
    mockGasket.config.docsify = {
      theme: 'bogus',
      config: {
        maxLevel: 4
      }
    };
    await docsView(mockGasket, mockDocsConfigSet);
    const results = mockGenerateContentStub.mock.calls[0][0];
    expect(results).toEqual({
      theme: 'bogus',
      port: 3000,
      config: {
        nameLink: '#/',
        auto2top: true,
        relativePath: true,
        maxLevel: 4
      }
    });
  });

  it('generates index', async () => {
    await docsView(mockGasket, mockDocsConfigSet);
    expect(mockGenerateContentStub).toHaveBeenCalledWith(expect.any(Object), mockDocsConfigSet);
  });

  it('serves doc root using docsify-cli', async () => {
    await docsView(mockGasket, mockDocsConfigSet);
    expect(mockServeStub).toHaveBeenCalledWith(mockDocsConfigSet.docsRoot, true, 3000);
  });
});
