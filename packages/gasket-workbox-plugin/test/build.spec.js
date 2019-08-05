const build = require('../lib/build');
const utils = require('../lib/utils');
const { copyWorkboxLibraries } = require('workbox-build');

describe('build', () => {
  let mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: utils.defaultConfig
      }
    };
  });

  it('copies workbox libraries to output dir', () => {
    build(mockGasket);
    const expectedOutput = utils.getOutputDir(mockGasket);
    expect(copyWorkboxLibraries).toHaveBeenCalledWith(expectedOutput);
  });
});
