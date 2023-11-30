const { Resolver } = require('../lib/resolver');
const { makeRequire } = require('./helpers');

const mockModules = {
  bogus: { name: 'Bogus' }
};

describe('Resolver', () => {
  let mockRequire;

  beforeEach(() => {
    mockRequire = makeRequire(mockModules);
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
      expect(result).toEqual('/path/to/node_modules/bogus');
    });

    it('throws if module not found', () => {
      const resolver = new Resolver();
      expect(() => resolver.resolve('missing')).toThrow(/Cannot find module/);
    });

    it('throws if package.json not exported', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.resolve('no-exported/package.json'))
        .toThrow(/Package subpath '\.\/package.json' is not defined by "exports"/);
    });

    it('uses resolver file require by default', () => {
      const resolver = new Resolver();
      expect(() => resolver.resolve('missing')).toThrow(/from 'lib\/resolver.js'/);
    });

    it('uses passed require', () => {
      const resolver = new Resolver({ require });
      expect(() => resolver.resolve('missing')).toThrow(/from 'test\/resolver.test.js'/);
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

    it('throws if package.json not exported', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.require('no-exported/package.json'))
        .toThrow(/Package subpath '\.\/package.json' is not defined by "exports"/);
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
      expect(result).toEqual('/path/to/node_modules/bogus');
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

    it('does not throw if package.json not exported', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.tryResolve('no-exported/package.json')).not.toThrow();
    });

    it('does not throw if module not found with windows path', () => {
      const resolver = new Resolver({ require: mockRequire });
      // ensure our helper will throw for the test setup
      expect(() => resolver.resolve('windows-paths/missing')).toThrow(/Cannot find module 'C:\\/);
      // test the expected behavior
      expect(() => resolver.tryResolve('windows-paths/missing')).not.toThrow();
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

    it('does not throw if package.json not exported', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.tryRequire('no-exported/package.json')).not.toThrow();
    });

    it('does throw if module has problems', () => {
      const resolver = new Resolver({ require: mockRequire });
      expect(() => resolver.tryRequire('broken')).toThrow();
    });

    it('does not throw if module not found with windows path', () => {
      const resolver = new Resolver({ require: mockRequire });
      // ensure our helper will throw for the test setup
      expect(() => resolver.require('windows-paths/missing')).toThrow(/Cannot find module 'C:\\/);
      // test the expected behavior
      expect(() => resolver.tryRequire('windows-paths/missing')).not.toThrow();
    });
  });
});
