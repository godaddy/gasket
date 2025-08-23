
const mockReadFile = vi.fn();

vi.mock('fs/promises', () => ({
  readFile: mockReadFile
}));

const Readme = (await import('../../../lib/scaffold/readme')).default;

describe('Readme', () => {
  let readme;

  beforeEach(() => {
    readme = new Readme();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty markdown and links', () => {
    expect(readme.markdown).toEqual([]);
    expect(readme.links).toEqual([]);
  });

  it('adds a new line', () => {
    readme.addNewLine();
    expect(readme.markdown).toEqual(['']);
  });

  it('adds a heading', () => {
    readme.heading('Heading');
    expect(readme.markdown).toEqual(['## Heading', '']);
  });

  it('adds a subheading', () => {
    readme.subHeading('Subheading');
    expect(readme.markdown).toEqual(['### Subheading', '']);
  });

  it('adds content', () => {
    readme.content('Content');
    expect(readme.markdown).toEqual(['Content', '']);
  });

  it('adds a list', () => {
    readme.list(['item1', 'item2']);
    expect(readme.markdown).toEqual(['- item1', '- item2', '']);
  });

  it('adds a link', () => {
    readme.link('link', 'href');
    expect(readme.links).toEqual(['[link]: href']);
  });

  it('adds a code block', () => {
    readme.codeBlock('code', 'js');
    expect(readme.markdown).toEqual(['```js', 'code', '```', '']);
  });

  it('reads a markdown file', async () => {
    mockReadFile.mockResolvedValue('file content');
    await readme.markdownFile('path');
    expect(mockReadFile).toHaveBeenCalledWith('path', 'utf8');
    expect(readme.markdown).toEqual(['file content', '']);
  });
});
