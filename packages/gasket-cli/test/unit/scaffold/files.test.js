/* eslint no-unused-vars: 0 */
const assume = require('assume');
const Files = require('../../../src/scaffold/files');


describe('Files', () => {
  let mockFiles;
  beforeEach(() => {
    mockFiles = new Files();
  });

  it('keeps track of added globs', () => {
    assume(mockFiles).property('globs');
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
});
