/* eslint-disable no-undefined */
const { matchMaker, expandMaker, makePackageIdentifier } = require('../lib/package-identifier');

const range = length => Array(length).fill().map((_, i) => i);

describe('matchMaker', () => {
  let result;

  it('returns object with convention positions', () => {
    const re = matchMaker('gasket');
    expect(re).toHaveProperty('prefixed');
    expect(re).toHaveProperty('postfixed');
    // expect(re).toHaveProperty('projectPostfixed', expect.any(RegExp));
  });

  it('prefixed has expected regex format', () => {
    const re = matchMaker('gasket');
    expect(re.prefixed).toHaveProperty('project', expect.any(RegExp));
    expect(re.prefixed).toHaveProperty('user', expect.any(RegExp));
  });

  it('postfixed has expected regex format', () => {
    const re = matchMaker('gasket');
    expect(re.postfixed).toHaveProperty('project', expect.any(RegExp));
    expect(re.postfixed).toHaveProperty('user', expect.any(RegExp));
  });

  it('requires project name', () => {
    expect(matchMaker).toThrow('projectName required');
  });

  it('creates regex with project name', () => {
    const re = matchMaker('gasket');
    expect(re.prefixed.project.toString()).toContain('@gasket');
    expect(re.prefixed.user.toString()).toContain('gasket');
  });

  it('defaults type to plugin', () => {
    const re = matchMaker('gasket');
    expect(re.prefixed.project.toString()).toContain('plugin');
  });

  it('supports custom types', () => {
    const re = matchMaker('gasket', 'preset');
    expect(re.prefixed.project.toString()).toContain('preset');
  });

  function testFormat(position, formatName, {
    doesMatch,
    doesNotMatch,
    matchElements
  }) {
    it(`matches format`, () => {
      const re = matchMaker('gasket');
      doesMatch.forEach(name => expect(re[position][formatName].test(name)).toBe(true));
    });

    it('does not match other formats', () => {
      const re = matchMaker('gasket');
      doesNotMatch.forEach(name => expect(re[position][formatName].test(name)).toBe(false));
    });

    it('extracts match elements', () => {
      Object.entries(matchElements).forEach(([name, expected]) => {
        const re = matchMaker('gasket');
        result = re[position][formatName].exec(name);
        expect(result).toEqual(expect.arrayContaining(expected));
        // verify order
        range(expected.length).forEach(i => expect(result[i]).toEqual(expected[i]));
      });
    });
  }

  describe('prefixed project format', () => {
    testFormat('prefixed', 'project', {
      doesMatch: [
        '@gasket/plugin-example',
        '@gasket/plugin-another-example'
      ],
      doesNotMatch: [
        '@user/gasket-plugin-example',
        'gasket-plugin-example',
        '@gasket/example-plugin'
      ],
      matchElements: {
        '@gasket/plugin-example': ['@gasket/plugin-example', '@gasket', 'example'],
        '@gasket/plugin-another-example': ['@gasket/plugin-another-example', '@gasket', 'another-example']
      }
    });
  });

  describe('postfixed project format', () => {
    testFormat('postfixed', 'project', {
      doesMatch: [
        '@gasket/example-plugin',
        '@gasket/another-example-plugin'
      ],
      doesNotMatch: [
        '@user/example-gasket-plugin',
        'gasket-plugin-example',
        '@gasket/plugin-example'
      ],
      matchElements: {
        '@gasket/example-plugin': ['@gasket/example-plugin', '@gasket', 'example'],
        '@gasket/another-example-plugin': ['@gasket/another-example-plugin', '@gasket', 'another-example']
      }
    });
  });

  describe('prefixed user format', () => {
    testFormat('prefixed', 'user', {
      doesMatch: [
        '@user/gasket-plugin-example',
        '@user/gasket-plugin-another-example',
        'gasket-plugin-example',
        'gasket-plugin-another-example'
      ],
      doesNotMatch: [
        '@gasket/plugin-example'
      ],
      matchElements: {
        '@user/gasket-plugin-example': ['@user/gasket-plugin-example', '@user', 'example'],
        '@user/gasket-plugin-another-example': ['@user/gasket-plugin-another-example', '@user', 'another-example'],
        'gasket-plugin-example': ['gasket-plugin-example', undefined, 'example'],
        'gasket-plugin-another-example': ['gasket-plugin-another-example', undefined, 'another-example']
      }
    });
  });

  describe('postfixed user format', () => {
    testFormat('postfixed', 'user', {
      doesMatch: [
        '@user/example-gasket-plugin',
        'example-gasket-plugin',
        '@user/another-example-gasket-plugin',
        'another-example-gasket-plugin'
      ],
      doesNotMatch: [
        '@gasket/example-plugin'
      ],
      matchElements: {
        '@user/example-gasket-plugin': ['@user/example-gasket-plugin', '@user', 'example'],
        '@user/another-example-gasket-plugin': ['@user/another-example-gasket-plugin', '@user', 'another-example'],
        'example-gasket-plugin': ['example-gasket-plugin', undefined, 'example'],
        'another-example-gasket-plugin': ['another-example-gasket-plugin', undefined, 'another-example']
      }
    });
  });
});

describe('expandMaker', () => {
  it('returns object with convention positions', () => {
    const expand = expandMaker('gasket');
    expect(expand).toHaveProperty('prefixed');
    expect(expand).toHaveProperty('postfixed');
    // expect(re).toHaveProperty('projectPostfixed', expect.any(RegExp));
  });

  it('prefixed has expected function', () => {
    const expand = expandMaker('gasket');
    expect(expand).toHaveProperty('prefixed', expect.any(Function));
  });

  it('postfixed has expected function', () => {
    const expand = expandMaker('gasket');
    expect(expand).toHaveProperty('postfixed', expect.any(Function));
  });

  it('requires project name', () => {
    expect(expandMaker).toThrow('projectName required');
  });

  it('expands short name with project name', () => {
    const expand = expandMaker('gasket');
    expect(expand.prefixed('@gasket/example')).toEqual('@gasket/plugin-example');
    expect(expand.prefixed('example')).toEqual('gasket-plugin-example');
  });

  it('defaults type to plugin', () => {
    const expand = expandMaker('gasket');
    expect(expand.prefixed('@gasket/example')).toEqual('@gasket/plugin-example');
  });

  describe('prefixed format', () => {
    const expand = expandMaker('gasket').prefixed;

    it('expands project scoped short name', () => {
      expect(expand('@gasket/example')).toEqual('@gasket/plugin-example');
    });

    it('expands user scoped short name', () => {
      expect(expand('@user/example')).toEqual('@user/gasket-plugin-example');
    });

    it('expands user short name', () => {
      expect(expand('example')).toEqual('gasket-plugin-example');
    });
  });

  describe('postfixed format', () => {
    const expand = expandMaker('gasket').postfixed;

    it('expands project scoped short name', () => {
      expect(expand('@gasket/example')).toEqual('@gasket/example-plugin');
    });

    it('expands user scoped short name', () => {
      expect(expand('@user/example')).toEqual('@user/example-gasket-plugin');
    });

    it('expands user short name', () => {
      expect(expand('example')).toEqual('example-gasket-plugin');
    });
  });
});

describe('makePackageIdentifier', () => {
  let result;

  it('returns factory function', () => {
    result = makePackageIdentifier('gasket');
    expect(result).toBeInstanceOf(Function);
    expect(result.name).toEqual('packageIdentifier');
  });

  it('factory exposes static method isValidFullName', () => {
    result = makePackageIdentifier('gasket');
    expect(result.isValidFullName).toBeInstanceOf(Function);
    expect(result.isValidFullName.name).toEqual('isValidFullName');
  });

  it('factory exposes static method lookup', () => {
    result = makePackageIdentifier('gasket');
    expect(result.lookup).toBeInstanceOf(Function);
    expect(result.lookup.name).toEqual('lookup');
  });

  it('requires project name', () => {
    expect(makePackageIdentifier).toThrow('projectName required');
  });

  it('defaults type to plugin', () => {
    const instance = makePackageIdentifier('gasket');
    result = instance('example').fullName;
    expect(result).toContain('plugin');
  });

  it('supports custom types', () => {
    const instance = makePackageIdentifier('gasket', { type: 'preset' });
    result = instance('example').fullName;
    expect(result).toContain('preset');
  });

  describe('isValidFullName', () => {
    const packageIdentifier = makePackageIdentifier('gasket');

    it('exposed static method', () => {
      expect(packageIdentifier.isValidFullName).toBeInstanceOf(Function);
    });

    it('true for valid @gasket names', () => {
      result = packageIdentifier.isValidFullName('@gasket/plugin-bogus');
      expect(result).toBe(true);
    });

    it('true for valid non-@gasket names', () => {
      result = packageIdentifier.isValidFullName('gasket-plugin-some-bogus');
      expect(result).toBe(true);
    });

    it('false for malformed names', () => {
      result = packageIdentifier.isValidFullName('some-bogus');
      expect(result).toBe(false);
    });
  });

  describe('lookup', () => {
    const packageIdentifier = makePackageIdentifier('gasket');
    let mockSet, mockHandler;

    beforeEach(() => {
      mockSet = new Set();
      mockHandler = id => mockSet.has(id.fullName);
    });

    it('exposed static method', () => {
      expect(packageIdentifier.lookup).toBeInstanceOf(Function);
    });

    describe('no scope', () => {

      it('finds prefixed format', () => {
        mockSet.add('gasket-plugin-example');
        result = packageIdentifier.lookup('example', mockHandler);
        expect(result.fullName).toEqual('gasket-plugin-example');
      });

      it('falls back to postfixed', () => {
        mockSet.add('example-gasket-plugin');
        result = packageIdentifier.lookup('example', mockHandler);
        expect(result.fullName).toEqual('example-gasket-plugin');
      });

      it('returns null if not found', () => {
        result = packageIdentifier.lookup('example', mockHandler);
        expect(result).toBe(null);
      });

      it('falls back to project + prefixed', () => {
        mockSet.add('@gasket/plugin-example');
        result = packageIdentifier.lookup('example', mockHandler);
        expect(result.fullName).toEqual('@gasket/plugin-example');
      });

      it('falls back to project + postfixed', () => {
        mockSet.add('@gasket/example-plugin');
        result = packageIdentifier.lookup('example', mockHandler);
        expect(result.fullName).toEqual('@gasket/example-plugin');
      });
    });

    describe('user scope', () => {

      it('finds prefixed format', () => {
        mockSet.add('@user/gasket-plugin-example');
        result = packageIdentifier.lookup('@user/example', mockHandler);
        expect(result.fullName).toEqual('@user/gasket-plugin-example');
      });

      it('falls back to postfixed', () => {
        mockSet.add('@user/example-gasket-plugin');
        result = packageIdentifier.lookup('@user/example', mockHandler);
        expect(result.fullName).toEqual('@user/example-gasket-plugin');
      });

      it('returns null if not found', () => {
        result = packageIdentifier.lookup('@user/example', mockHandler);
        expect(result).toBe(null);
      });
    });

    describe('project scope', () => {

      it('finds prefixed format', () => {
        mockSet.add('@gasket/plugin-example');
        result = packageIdentifier.lookup('@gasket/example', mockHandler);
        expect(result.fullName).toEqual('@gasket/plugin-example');
      });

      it('falls back to postfixed', () => {
        mockSet.add('@gasket/example-plugin');
        result = packageIdentifier.lookup('@gasket/example', mockHandler);
        expect(result.fullName).toEqual('@gasket/example-plugin');
      });

      it('returns null if not found', () => {
        result = packageIdentifier.lookup('@gasket/example', mockHandler);
        expect(result).toBe(null);
      });
    });
  });
});
