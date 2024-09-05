const create = require('../lib/create');
const { name, version, devDependencies } = require('../package.json');

describe('createHook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn()
      },
      readme: {
        subHeading: jest.fn().mockReturnThis(),
        content: jest.fn().mockReturnThis(),
        link: jest.fn().mockReturnThis()
      },
      gasketConfig: {
        addPlugin: jest.fn()
      }
    };
  });

  it('is a function', function () {
    expect(create).toEqual(expect.any(Function));
  });

  it('adds itself to the dependencies', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });

  it('adds devDependencies', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      '@docusaurus/core': devDependencies['@docusaurus/core'],
      '@docusaurus/preset-classic': devDependencies['@docusaurus/preset-classic'],
      'react': devDependencies.react,
      'react-dom': devDependencies['react-dom'],
      'ajv': devDependencies.ajv
    });
  });

  it('add plugin import to the gasket file', async () => {
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginDocusaurus', name);
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
