const mockPackageManagerStub = jest.fn();

jest.mock('@gasket/utils', () => {
  return {
    PackageManager: {
      spawnNpm: mockPackageManagerStub
    }
  };
});

const Fetcher = require('../../../src/scaffold/fetcher');

describe('fetcher', () => {
  const stdout = 'example.tr.gz\nits all good';

  beforeEach(() => {
    mockPackageManagerStub.mockResolvedValue({ stdout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#fetch', function () {
    it('allows the cwd to be configured for package fetching', async () => {
      const fetcher = new Fetcher({});

      await fetcher.fetch('example', '/foo/bar');
      expect(mockPackageManagerStub.mock.calls[0][1].cwd).toEqual('/foo/bar');
    });
  });

  describe('#clone', function () {
    it('fetches the package into the tmp dir', async () => {
      const packageName = 'whatever';
      const fetcher = new Fetcher({
        packageName
      });

      fetcher.unpack = jest.fn().mockResolvedValue('example');
      await fetcher.clone();
      expect(mockPackageManagerStub.mock.calls[0][1].cwd).toContain(fetcher.tmp.dir);
    });
  });
});
