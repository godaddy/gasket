/* eslint no-unused-vars: 0 */
const assume = require('assume');
const Files = require('../../../src/scaffold/files');


describe('Files', () => {
  let mockFiles;
  beforeEach(() => {
    mockFiles = new Files();
  });

  it('keeps track of added globs', () => {
    assume(mockFiles.globs).instanceOf(Array);
  });

  it('adds files to globs', () => {
    mockFiles.add({ globs: ['some/file/path'] });
    assume(mockFiles.globs).length(1);
    mockFiles.add({ globs: ['another/file/path'] });
    assume(mockFiles.globs).length(2);
  });

  it('add multiple file arguments to globs', () => {
    mockFiles.add({ globs: ['some/file/path', 'another/file/path'] });
    assume(mockFiles.globs).length(2);
  });

  it('keeps track of added globSets', () => {
    assume(mockFiles.globSets).instanceOf(Array);
  });

  it('adds info to globSets', () => {
    mockFiles.add({ globs: ['some/file/path'], source: '@gasket/plugin-example' });
    assume(mockFiles.globSets).length(1);
    assume(mockFiles.globSets[0]).objectContaining({
      globs: ['some/file/path'],
      source: '@gasket/plugin-example'
    });
    mockFiles.add({ globs: ['another/file/path'], source: '@gasket/plugin-other-example' });
    assume(mockFiles.globs).length(2);
    assume(mockFiles.globSets[1]).objectContaining({
      globs: ['another/file/path'],
      source: '@gasket/plugin-other-example'
    });
  });

  it('allows multiple glob arguments to globSets', () => {
    mockFiles.add({ globs: ['some/file/path', 'another/file/path'], source: '@gasket/plugin-multi-example' });
    assume(mockFiles.globSets).length(1);
    assume(mockFiles.globSets[0]).objectContaining({
      globs: ['some/file/path', 'another/file/path'],
      source: '@gasket/plugin-multi-example'
    });
  });
});
