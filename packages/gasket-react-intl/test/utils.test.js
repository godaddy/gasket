import { ensureArray, needsToLoad } from '../src/utils';

describe('utils', () => {
  describe('ensureArray', () => {
    it('should return an array', () => {
      expect(ensureArray('single')).toEqual(['single']);
    });

    it('should return existing array', () => {
      const arr = ['single', 'double'];
      expect(ensureArray(arr)).toEqual(['single', 'double']);
    });

    it('strips nullish entries', () => {
      // eslint-disable-next-line no-undefined
      const arr = ['single', undefined, null, 'double'];
      expect(ensureArray(arr)).toEqual(['single', 'double']);
    });
  });

  describe('needsToLoad', () => {
    it('should return true for not handled', () => {
      expect(needsToLoad('notHandled')).toBe(true);
    });

    it('should return true for not loaded', () => {
      expect(needsToLoad('notLoaded')).toBe(true);
    });

    it('should return false for loading', () => {
      expect(needsToLoad('loading')).toBe(false);
    });

    it('should return false for error', () => {
      expect(needsToLoad('error')).toBe(false);
    });

    it('should return false for loaded', () => {
      expect(needsToLoad('loaded')).toBe(false);
    });
  });
});
