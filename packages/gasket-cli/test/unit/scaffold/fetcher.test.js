const mockPackageManagerStub = jest.fn();

jest.mock('@gasket/utils', () => {
  return {
    PackageManager: {
      spawnNpm: mockPackageManagerStub
    }
  }
});

const path = require('path');
const { homedir } = require('os');
const Fetcher = require('../../../src/scaffold/fetcher');

describe('fetcher', () => {
  const stdout = 'example.tr.gz\nits all good';

  beforeEach(() => {
    mockPackageManagerStub.mockResolvedValue({ stdout })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#fetch', function () {
    it('passes npmconfig to npm pack when defined', async () => {
      const npmconfig = path.join(homedir(), 'whatever', '.npmrc');
      const packageName = 'whatever';
      const fetcher = new Fetcher({
        npmconfig,
        packageName
      });

      await fetcher.fetch();
      expect(mockPackageManagerStub.mock.calls[0][0]).toContain('--userconfig', npmconfig);
    });

    it('allows the cwd to be configured for package fetching', async () => {
      const fetcher = new Fetcher({});

      await fetcher.fetch('example', '/foo/bar');
      expect(mockPackageManagerStub.mock.calls[0][1].cwd).toEqual('/foo/bar');
    });
  });

  describe('#clone', function () {
    it('fetches the package into the tmp dir', async () => {
      const npmconfig = path.join(homedir(), 'whatever', '.npmrc');
      const packageName = 'whatever';
      const fetcher = new Fetcher({
        npmconfig,
        packageName
      });

      fetcher.unpack = jest.fn().mockResolvedValue('example');
      await fetcher.clone();
      expect(mockPackageManagerStub.mock.calls[0][1].cwd).toContain(fetcher.tmp.dir);
    });
  });
});
