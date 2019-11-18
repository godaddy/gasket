const assume = require('assume');
const { sortModules, sortStructures, sortCommands } = require('../../lib/utils/sorts');

describe('utils - sorts', () => {

  describe('sortModules', () => {
    it('gasket scope > user scope > no scope > app plugins', () => {
      const begin = [
        'plugins/gasket-plugin-a',
        '@gasket/plugin-c',
        '@user/gasket-plugin-b',
        'gasket-plugin-c',
        '@gasket/plugin-a',
        '@user/gasket-plugin-c',
        'gasket-plugin-a',
        '@user/gasket-plugin-a',
        '@gasket/plugin-b',
        'plugins/gasket-plugin-b',
        'gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const expected = [
        '@gasket/plugin-a',
        '@gasket/plugin-b',
        '@gasket/plugin-c',
        '@user/gasket-plugin-a',
        '@user/gasket-plugin-b',
        '@user/gasket-plugin-c',
        'gasket-plugin-a',
        'gasket-plugin-b',
        'gasket-plugin-c',
        'plugins/gasket-plugin-a',
        'plugins/gasket-plugin-b',
        'plugins/gasket-plugin-c'
      ];

      const results = sortModules(begin.map(name => ({ name }))).map(p => p.name);
      assume(results).eqls(expected);
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
      assume(results).eqls(expected);
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
      assume(results).eqls(expected);
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
      assume(results).eqls(expected);
    });
  });
});
