const create = require('../lib/create');
const { name, version, devDependencies } = require('../package.json');

describe('createHook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn()
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
      'react-dom': devDependencies['react-dom']
    });
  });

  it('add plugin import to the gasket file', async () => {
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginDocusaurus', name);
  });
});
