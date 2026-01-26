const { sortModules, sortStructures, sortCommands, sortGuides, sortConfigurations } = require('../../lib/utils/sorts');

describe('utils - sorts', () => {

  describe('sortModules', () => {
    it('gasket scope > user scope > no scope > app plugins', () => {
      const begin = [
        'plugins/gasket-plugin-a',
        '@gasket/plugin-c',
        '@user/gasket-plugin-b',
        'gasket-plugin-c',
        '@gasket/aaa',
        '@gasket/plugin-a',
        '@user/aaa',
        '@user/gasket-plugin-c',
        'gasket-plugin-a',
        '@user/gasket-plugin-a',
        '@gasket/plugin-b',
        'aaa',
        'plugins/gasket-plugin-b',
        'gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const expected = [
        '@gasket/plugin-a',
        '@gasket/plugin-b',
        '@gasket/plugin-c',
        '@gasket/aaa',
        '@user/gasket-plugin-a',
        '@user/gasket-plugin-b',
        '@user/gasket-plugin-c',
        '@user/aaa',
        'gasket-plugin-a',
        'gasket-plugin-b',
        'gasket-plugin-c',
        'aaa',
        'plugins/gasket-plugin-a',
        'plugins/gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const results = sortModules(begin.map(name => ({ name }))).map(p => p.name);
      expect(results).toEqual(expected);
    });
  });

  describe('sortGuides', () => {
    it('gasket/cli > gasket scope > user scope > no scope > app plugins', () => {
      const begin = [
        'plugins/gasket-plugin-a',
        '@gasket/plugin-c',
        '@user/gasket-plugin-b',
        'gasket-plugin-c',
        '@gasket/aaa',
        '@gasket/plugin-a',
        '@user/aaa',
        '@user/gasket-plugin-c',
        'gasket-plugin-a',
        '@user/gasket-plugin-a',
        '@gasket/plugin-b',
        'aaa',
        'plugins/gasket-plugin-b',
        'gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const expected = [
        '@gasket/plugin-a',
        '@gasket/plugin-b',
        '@gasket/plugin-c',
        '@gasket/aaa',
        '@user/gasket-plugin-a',
        '@user/gasket-plugin-b',
        '@user/gasket-plugin-c',
        '@user/aaa',
        'gasket-plugin-a',
        'gasket-plugin-b',
        'gasket-plugin-c',
        'aaa',
        'plugins/gasket-plugin-a',
        'plugins/gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const results = sortGuides(begin.map(from => ({ from }))).map(p => p.from);
      expect(results).toEqual(expected);
    });
  });

  describe('sortStructures', () => {
    it('hidden dirs > dirs > hidden files > files', () => {
      const begin = [
        'a',
        '.c/',
        'b/',
        '.c',
        '.a/',
        'c/',
        '.a',
        'a/',
        '.b/',
        'b',
        '.b',
        'c'
      ];

      const expected = [
        '.a/',
        '.b/',
        '.c/',
        'a/',
        'b/',
        'c/',
        '.a',
        '.b',
        '.c',
        'a',
        'b',
        'c'
      ];

      const results = sortStructures(begin.map(name => ({ name }))).map(p => p.name);
      expect(results).toEqual(expected);
    });
  });

  describe('sortCommands', () => {
    it('sorts alphabetically', () => {
      const begin = [
        'b',
        'd',
        'c',
        'a'
      ];

      const expected = [
        'a',
        'b',
        'c',
        'd'
      ];

      const results = sortCommands(begin.map(name => ({ name }))).map(p => p.name);
      expect(results).toEqual(expected);
    });
  });

  describe('sortConfigurations', () => {
    it('sorts alphabetically', () => {
      const begin = [
        'b',
        'd',
        'c',
        'a'
      ];

      const expected = [
        'a',
        'b',
        'c',
        'd'
      ];

      const results = sortConfigurations(begin.map(name => ({ name }))).map(p => p.name);
      expect(results).toEqual(expected);
    });
  });
});
