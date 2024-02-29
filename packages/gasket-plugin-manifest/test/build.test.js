const mockWriteFileStub = jest.fn();
const mockMkdirpStub = jest.fn();

jest.mock('fs', () => ({
  promises: {
    writeFile: mockWriteFileStub
  }
}));
jest.mock('mkdirp', () => mockMkdirpStub);

const build = require('../lib/build');

describe('build', function () {
  let gasket;

  beforeEach(function () {
    gasket = {
      execWaterfall: jest.fn().mockResolvedValue([]),
      config: {
        root: 'test',
        manifest: {
          staticOutput: '/custom/manifest.json'
        }
      },
      logger: {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn()
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('is a function', function () {
    expect(typeof build).toBe('function');
    expect(build).toHaveLength(1);
  });

  it('skips logic when staticOutput config is not set', async function () {
    gasket.config.manifest = {};
    await build(gasket);

    expect(mockMkdirpStub).not.toHaveBeenCalled();
  });

  it('creates custom output directory', async function () {
    gasket.config.manifest.staticOutput =
      '/super/cool/custom/path/manifest.json';
    await build(gasket);
    expect(mockMkdirpStub).toHaveBeenCalled();
    expect(mockMkdirpStub.mock.calls[0][0]).toEqual('/super/cool/custom/path/');
  });

  it('writes manifest to specified path', async function () {
    await build(gasket);
    expect(mockWriteFileStub.mock.calls.length).toBe(1);
    expect(mockWriteFileStub.mock.calls[0]).toEqual([
      '/custom/manifest.json',
      '[]',
      'utf-8'
    ]);
  });

  it('logs completion message', async function () {
    await build(gasket);
    expect(gasket.logger.info.mock.calls.length).toBe(1);
    expect(gasket.logger.info.mock.calls[0][0]).toContain(
      'custom/manifest.json).'
    );
  });
});
