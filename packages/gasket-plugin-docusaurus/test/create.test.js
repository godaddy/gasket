const create = require('../lib/create');
const { name, version, devDependencies } = require('../package.json');

describe('createHook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      useDocusaurus: true,
      pkg: {
        add: jest.fn()
      },
      readme: {
        subHeading: jest.fn().mockReturnThis(),
        content: jest.fn().mockReturnThis(),
        link: jest.fn().mockReturnThis()
      },
      gasketConfig: {
        addCommand: jest.fn()
      }
    };
  });

  it('is a function', function () {
    expect(create).toEqual(expect.any(Function));
  });

  it('does not add itself to the dependencies if useDocs is false', async () => {
    mockContext.useDocusaurus = false;
    await create({}, mockContext);
    expect(mockContext.pkg.add).not.toHaveBeenCalled();
  });

  it('adds devDependencies', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      [name]: `^${version}`,
      '@docusaurus/core': devDependencies['@docusaurus/core'],
      '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom'],
      'ajv': devDependencies.ajv,
      'typescript': devDependencies.typescript,
      'search-insights': devDependencies['search-insights']
    });
  });

  it('add as dynamicPlugin import to the docs command', async () => {
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addCommand).toHaveBeenCalledWith('docs', {
      dynamicPlugins: [
        `${name}`
      ]
    });
  });

  it('adds a link to the readme', async () => {
    await create({}, mockContext);
    expect(mockContext.readme.link).toHaveBeenCalledWith('Docusaurus', 'https://docusaurus.io/');
  });

  it('adds content to the readme', async () => {
    await create({}, mockContext);
    expect(mockContext.readme.content).toHaveBeenCalledWith('When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.');
  });

  it('adds a subHeading to the readme', async () => {
    await create({}, mockContext);
    expect(mockContext.readme.subHeading).toHaveBeenCalledWith('Docusaurus');
  });
});
