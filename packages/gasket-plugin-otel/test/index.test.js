const plugin = require('../lib/index');
const { dependencies } = require('../package.json');

describe('@gasket/plugin-otel', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      files: {
        add: jest.fn()
      },
      pkg: {
        add: jest.fn()
      }
    };
  });

  it('should export an object', () => {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('should have a name', () => {
    expect(plugin.name).toEqual('@gasket/plugin-otel');
  });

  describe('createHook', () => {

    it('should have a create hook', () => {
      expect(plugin.hooks.create).toBeInstanceOf(Function);
    });

    it('should add files', () => {
      plugin.hooks.create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/\*$/));
    });

    it('should add dependencies', () => {
      plugin.hooks.create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', dependencies);
    });

    it('should add scripts', () => {
      plugin.hooks.create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        start: 'node --import ./instrumentation.js server.js'
      });
    });
  });
});
