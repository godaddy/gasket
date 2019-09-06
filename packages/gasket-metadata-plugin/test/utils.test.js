const assume = require('assume');
const { sanitize } = require('../lib/utils');

describe('Utils', () => {

  describe('sanitize', () => {

    it('returns transformed object', () => {
      const target = { some: 'data' };
      const results = sanitize(target);
      assume(results).equals(target);
    });

    it('redacts functions', () => {
      const mockFn = f => f;
      const results = sanitize(mockFn);

      assume(results).a('function');
      assume(results).not.equals(mockFn);
      assume(results.name).equals('redacted');
    });

    it('redacts functions which are object properties', () => {
      const mockFn = f => f;
      const target = { some: 'data', fn: mockFn };
      assume(target.fn).equals(mockFn);

      const results = sanitize(target);
      assume(results.fn).a('function');
      assume(results.fn).not.equals(mockFn);
      assume(results.fn.name).equals('redacted');
    });

    it('does recurse through objects', () => {
      const mockFn = f => f;
      const target = { some: 'data', deep: { fn: mockFn } };

      const results = sanitize(target);
      assume(results.deep.fn).a('function');
      assume(results.deep.fn).not.equals(mockFn);
      assume(results.deep.fn.name).equals('redacted');
    });

    it('redacts functions within arrays', () => {
      const mockFn = f => f;
      const target = { some: 'data', fns: [mockFn, mockFn] };

      const results = sanitize(target);

      results.fns.forEach(fn => {
        assume(fn).a('function');
        assume(fn).not.equals(mockFn);
        assume(fn.name).equals('redacted');
      });
    });

    it('does not transform non-function properties', () => {
      assume(sanitize(1)).equals(1);
      assume(sanitize('a')).equals('a');
      assume(sanitize([1, 'a'])).deep.equals([1, 'a']);
    });
  });
});
