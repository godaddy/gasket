const mockBuildManifest = jest.fn().mockResolvedValue();
const mockBuildModules = jest.fn().mockResolvedValue();

jest.mock('../lib/build-manifest', () => mockBuildManifest);
jest.mock('../lib/build-modules', () => mockBuildModules);

const plugin = require('../lib/index');

describe('build', function () {
  let mockGasket, buildHook;

  beforeEach(function () {
    mockGasket = {
      config: {
        intl: {}
      }
    };

    buildHook = plugin.hooks.build;
  });

  it('has expected timing', function () {
    expect(buildHook).toHaveProperty('timing');
    expect(buildHook.timing).toHaveProperty('first', true);
  });

  it('builds manifest file', async function () {
    await buildHook.handler(mockGasket);
    expect(mockBuildModules).not.toHaveBeenCalled();
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket);
  });

  it('builds modules if set in config', async function () {
    mockGasket.config.intl.modules = {};
    await buildHook.handler(mockGasket);
    expect(mockBuildModules).toHaveBeenCalledWith(mockGasket);
    expect(mockBuildManifest).toHaveBeenCalledWith(mockGasket);
  });
});
