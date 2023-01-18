/* eslint no-unused-vars: 0 */
const Gitignore = require('../lib/gitignore');


describe('Gitignore', () => {
  let mockGitignore;
  beforeEach(() => {
    mockGitignore = new Gitignore();
  });

  it('keeps track of default gitignore content', () => {
    expect(mockGitignore).toHaveProperty('_content');
    expect(mockGitignore._content).toBeInstanceOf(Object);
  });

  it('adds content to gitignore', () => {
    mockGitignore.add('test_file');
    expect([mockGitignore._content['']]).toHaveLength(1);
  });

  it('adds content with category to gitignore', () => {
    mockGitignore.add('test_file', 'test_category');
    expect([mockGitignore._content.test_category]).toHaveLength(1);
    expect([...mockGitignore._content.test_category]).toEqual(['test_file']);
  });

  it('adds multiple files/dirs to gitignore', () => {
    mockGitignore.add(['test_file1', 'test_file2']);
    expect([...mockGitignore._content['']]).toHaveLength(2);
  });
});
