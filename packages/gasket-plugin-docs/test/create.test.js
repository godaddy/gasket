const { hooks: { create } } = require('../lib/index');
const { name, version } = require('../package.json');

describe('the create hook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: jest.fn()
      },
      gasketConfig: {
        addPlugin: jest.fn()
      },
      gitignore: {
        add: jest.fn()
      }
    };
  });

  it('adds itself to the dependencies', () => {
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });

  it('add plugin import to the gasket file', () => {
    create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginDocs', name);
  });

  it('should add a gitignore entry for the .docs directory', () => {
    create({}, mockContext);

    expect(mockContext.gitignore.add).toHaveBeenCalledWith('.docs', 'Documentation');
  });

  it('should handle when no `gitignore` is present in the create context', () => {
    expect(() => create({}, mockContext)).not.toThrow(Error);
  });
});
