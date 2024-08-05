const mockBuildManifest = jest.fn().mockResolvedValue();

jest.mock('../lib/build-manifest', () => mockBuildManifest);

const postCreateHook = require('../lib/post-create');

describe('build', function () {
  let mockGasket;
  let mockContext;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {
          managerFilename: 'intl.js'
        }
      }
    };

    mockContext = {
      dest: '/path/to/dest',
      generatedFiles: new Set()
    };
  });

  it('builds manifest file', async function () {
    const expectedOptions = {
      root: mockContext.dest,
      silent: true
    };

    await postCreateHook(mockGasket, mockContext);
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket, expectedOptions);
  });

  it('adds manager filename to generated files', async function () {
    await postCreateHook(mockGasket, mockContext);
    expect(mockContext.generatedFiles.has(mockGasket.config.intl.managerFilename)).toBe(true);
  });
});
