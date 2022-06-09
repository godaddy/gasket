const assume = require('assume');
const { sortModules, sortStructures, sortCommands, sortGuides, sortConfigurations } = require('../../lib/utils/sorts');

describe('utils - sorts', () => {

  describe('sortModules', () => {
    it('gasket scope > user scope > no scope > app plugins', () => {
      const begin = [
        'plugins/gasket-plugin-a',
        '@gasket/preset-a',
        '@user/gasket-plugin-b',
        'gasket-preset-a',
        '@gasket/aaa',
        '@gasket/plugin-a',
        '@user/aaa',
        '@user/gasket-preset-a',
        'gasket-plugin-a',
        '@gasket/cli',
        '@user/gasket-plugin-a',
        '@gasket/plugin-b',
        'aaa',
        'plugins/gasket-plugin-b',
        'gasket-plugin-b',
        'plugins/gasket-preset-a'
      ];

      const expected = [
        '@gasket/preset-a',
        '@gasket/plugin-a',
        '@gasket/plugin-b',
        '@gasket/aaa',
        '@gasket/cli',
        '@user/gasket-preset-a',
        '@user/gasket-plugin-a',
        '@user/gasket-plugin-b',
        '@user/aaa',
        'gasket-preset-a',
        'gasket-plugin-a',
        'gasket-plugin-b',
        'aaa',
        'plugins/gasket-preset-a',
        'plugins/gasket-plugin-a',
        'plugins/gasket-plugin-b'
      ];

      const results = sortModules(begin.map(name => ({ name }))).map(p => p.name);
      assume(results).eqls(expected);
    });
  });

  describe('sortGuides', () => {
    it('gasket/cli > gasket scope > user scope > no scope > app plugins', () => {
      const begin = [
        'plugins/gasket-plugin-a',
        '@gasket/preset-a',
        '@user/gasket-plugin-b',
        'gasket-preset-a',
        '@gasket/aaa',
        '@gasket/plugin-a',
        '@user/aaa',
        '@user/gasket-preset-a',
        'gasket-plugin-a',
        '@gasket/cli',
        '@user/gasket-plugin-a',
        '@gasket/plugin-b',
        'aaa',
        'plugins/gasket-plugin-b',
        'gasket-plugin-b',
        'plugins/gasket-preset-a'
      ];

      const expected = [
        '@gasket/cli',
        '@gasket/preset-a',
        '@gasket/plugin-a',
        '@gasket/plugin-b',
        '@gasket/aaa',
        '@user/gasket-preset-a',
        '@user/gasket-plugin-a',
        '@user/gasket-plugin-b',
        '@user/aaa',
        'gasket-preset-a',
        'gasket-plugin-a',
        'gasket-plugin-b',
        'aaa',
        'plugins/gasket-preset-a',
        'plugins/gasket-plugin-a',
        'plugins/gasket-plugin-b'
      ];

      const results = sortGuides(begin.map(from => ({ from }))).map(p => p.from);
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
      assume(results).eqls(expected);
    });
  });
});
