/* eslint no-unused-vars: 0 */
const assume = require('assume');
const Gitignore = require('../lib/gitignore');


describe('Gitignore', () => {
  let mockGitignore;
  beforeEach(() => {
    mockGitignore = new Gitignore();
  });

  it('keeps track of default gitignore content', () => {
    assume(mockGitignore).property('_content');
    assume(mockGitignore._content).instanceOf(Object);
  });

  it('adds content to gitignore', () => {
    mockGitignore.add('test_file');
    assume([mockGitignore._content['']]).length(1);
  });

  it('adds content with category to gitignore', () => {
    mockGitignore.add('test_file', 'test_category');
    assume([mockGitignore._content.test_category]).length(1);
    assume([...mockGitignore._content.test_category]).eqls(['test_file']);
  });

  it('adds multiple files/dirs to gitignore', () => {
    mockGitignore.add(['test_file1', 'test_file2']);
    assume([...mockGitignore._content['']]).length(2);
  });
});
