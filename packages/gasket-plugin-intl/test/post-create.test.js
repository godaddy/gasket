const mockBuildManifest = jest.fn().mockResolvedValue();

jest.mock('../lib/build-manifest', () => mockBuildManifest);

const postCreateHook = require('../lib/post-create');

describe('build', function () {
  let mockGasket;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {}
      }
    };
  });

  it('builds manifest file', async function () {
    const mockCreateContext = {
      dest: '/path/to/dest',
      generatedFiles: new Set()
    };

    const expectedOptions = {
      root: mockCreateContext.dest,
      silent: true
    };

    await postCreateHook(mockGasket, mockCreateContext);
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket, expectedOptions);
  });
});
