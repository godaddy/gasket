const Resolver = require('../lib/resolver');

const mockModules = {
  '/some/path/to/bogus': { name: 'Bogus' },
  get '/some/path/to/broken'() { throw new Error('Bad things'); } // eslint-disable-line no-eval
};

const mockPaths = {
  bogus: '/some/path/to/bogus',
  broken: '/some/path/to/broken'
};

describe('Resolver', () => {
  let mockRequire;

  beforeEach(() => {
    mockRequire = jest.fn(mod => {
      if (mockModules[mod]) {
        return mockModules[mod];
      }
      const err = new Error(`Cannot find module '${mod}' from 'mocked'`);
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    });
    mockRequire.resolve = jest.fn(mod => {
      if (mockPaths[mod]) {
        return mockPaths[mod];
      }
      const err = new Error(`Cannot find module '${mod}' from 'mocked'`);
      err.code = 'MODULE_NOT_FOUND';
      throw err;
    });
  });

  it('exposes expected methods', () => {
    const resolver = new Resolver();
    expect(resolver.require).toBeDefined();
    expect(resolver.resolve).toBeDefined();
    expect(resolver.tryRequire).toBeDefined();
    expect(resolver.tryResolve).toBeDefined();
  });

  it('accepts resolveFrom param', () => {
    let resolver = new Resolver();
    expect(resolver._resolveFrom).not.toBeDefined();

    resolver = new Resolver({ resolveFrom: '/some/path' });
    expect(resolver._resolveFrom).toBeDefined();
  });

  it('resolveFrom can be a string', () => {
    const resolver = new Resolver({ resolveFrom: '/some/path' });
    expect(resolver._resolveFrom).toBeInstanceOf(Array);
    expect(resolver._resolveFrom).toHaveLength(1);
  });

  it('resolveFrom can be a string array', () => {
    const resolver = new Resolver({ resolveFrom: ['/some/path', 'some/other/path'] });
    expect(resolver._resolveFrom).toBeInstanceOf(Array);
    expect(resolver._resolveFrom).toHaveLength(2);
  });

  it('accepts a require param', () => {
    const resolver = new Resolver({ require: mockRequire });
    expect(resolver._require).toBe(mockRequire);
  });

  describe('.resolve', () => {

    it('calls require.resolve', () => {
      const resolver = new Resolver({ require: mockRequire });
      resolver.resolve('bogus');
      expect(mockRequire.resolve).toHaveBeenCalled();
    });

    it('passes paths if resolveFrom set', () => {
      const resolveFrom = ['/some/path'];
      const resolver = new Resolver({ require: mockRequire, resolveFrom });
      resolver.resolve('bogus');

      expect(mockRequire.resolve).toHaveBeenCalledWith(
        'bogus',
        expect.objectContaining({ paths: resolveFrom }));
    });

    it('returns resolved path', () => {
      const resolver = new Resolver({ require: mockRequire });
      const result = resolver.resolve('bogus');
      expect(result).toEqual('/some/path/to/bogus');
    });

    it('throws if module not found', () => {
      const resolver = new Resolver();
      expect(() => resolver.resolve('missing')).toThrow(/Cannot find module/);
    });

    it('uses resolver file require by default', () => {
      const resolver = new Resolver();
      expect(() => resolver.resolve('missing')).toThrow(/from 'resolver.js'/);
    });

    it('uses passed require', () => {
      const resolver = new Resolver({ require });
      expect(() => resolver.resolve('missing')).toThrow(/from 'resolver.test.js'/);
    });
  });

  describe('.require', () => {

    it('calls require', () => {
      const resolver = new Resolver({ require: mockRequire });
      resolver.require('bogus');
      expect(mockRequire).toHaveBeenCalled();
    });

    it('calls require.resolve first to allow paths', () => {
      const resolver = new Resolver({ require: mockRequire });
      resolver.require('bogus');
      expect(mockRequire.resolve).toHaveBeenCalled();
    });

    it('uses paths if resolveFrom set', () => {
      const resolveFrom = ['/some/path'];
      const resolver = new Resolver({ require: mockRequire, resolveFrom });
      resolver.require('bogus');

      expect(mockRequire.resolve).toHaveBeenCalledWith(
        'bogus',
        expect.objectContaining({ paths: resolveFrom }));
    });

    it('returns resolved module', () => {
      const resolver = new Resolver({ require: mockRequire });
      const result = resolver.require('bogus');
      expect(result).toEqual(expect.objectContaining({ name: 'Bogus' }));
    });

    it('throws if module not found', () => {
      const resolver = new Resolver();
      expect(() => resolver.require('missing')).toThrow(/Cannot find module/);
    });

    it('throws if module malformed', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.require('broken')).toThrow();
    });
  });

  describe('.tryResolve', () => {

    it('returns resolved path', () => {
      const resolver = new Resolver({ require: mockRequire });
      const result = resolver.tryResolve('bogus');
      expect(result).toEqual('/some/path/to/bogus');
    });

    it('returns null if module not found', () => {
      const resolver = new Resolver();
      const result = resolver.tryResolve('missing');
      expect(result).toBe(null);
    });

    it('does not throw if module not found', () => {
      const resolver = new Resolver();
      expect(() => resolver.tryResolve('missing')).not.toThrow();
    });
  });

  describe('.tryRequire', () => {

    it('returns resolved module', () => {
      const resolver = new Resolver({ require: mockRequire });
      const result = resolver.tryRequire('bogus');
      expect(result).toEqual(expect.objectContaining({ name: 'Bogus' }));
    });

    it('returns null if module not found', () => {
      const resolver = new Resolver();
      const result = resolver.tryRequire('missing');
      expect(result).toBe(null);
    });

    it('does not throw if module not found', () => {
      const resolver = new Resolver();
      expect(() => resolver.tryRequire('missing')).not.toThrow();
    });

    it('does throw if module has problems', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.tryRequire('broken')).toThrow();
    });
  });
});
