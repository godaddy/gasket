/* eslint no-unused-vars: 0 */
const Files = require('../../../src/scaffold/files');


describe('Files', () => {
  let mockFiles;
  beforeEach(() => {
    mockFiles = new Files();
  });

  it('keeps track of added globs', () => {
    expect(mockFiles.globs).toBeInstanceOf(Array);
  });

  it('adds files to globs', () => {
    mockFiles.add({ globs: ['some/file/path'] });
    expect(mockFiles.globs).toHaveLength(1);
    mockFiles.add({ globs: ['another/file/path'] });
    expect(mockFiles.globs).toHaveLength(2);
  });

  it('add multiple file arguments to globs', () => {
    mockFiles.add({ globs: ['some/file/path', 'another/file/path'] });
    expect(mockFiles.globs).toHaveLength(2);
  });

  it('keeps track of added globSets', () => {
    expect(mockFiles.globSets).toBeInstanceOf(Array);
  });

  it('adds info to globSets', () => {
    mockFiles.add({ globs: ['some/file/path'], source: '@gasket/plugin-example' });
    expect(mockFiles.globSets).toHaveLength(1);
    expect(mockFiles.globSets[0]).toEqual(expect.objectContaining({
      globs: ['some/file/path'],
      source: '@gasket/plugin-example'
    }));
    mockFiles.add({ globs: ['another/file/path'], source: '@gasket/plugin-other-example' });
    expect(mockFiles.globs).toHaveLength(2);
    expect(mockFiles.globSets[1]).toEqual(expect.objectContaining({
      globs: ['another/file/path'],
      source: '@gasket/plugin-other-example'
    }));
  });

  it('allows multiple glob arguments to globSets', () => {
    mockFiles.add({ globs: ['some/file/path', 'another/file/path'], source: '@gasket/plugin-multi-example' });
    expect(mockFiles.globSets).toHaveLength(1);
    expect(mockFiles.globSets[0]).toEqual(expect.objectContaining({
      globs: ['some/file/path', 'another/file/path'],
      source: '@gasket/plugin-multi-example'
    }));
  });
});
