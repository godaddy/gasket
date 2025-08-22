
import create from '../lib/create.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  it('should be a function', () => {
    expect(create).toEqual(expect.any(Function));
  });

  it('should add pluginDynamicPlugins to gasketConfig', () => {
    create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginDynamicPlugins', name);
  });

  it('should add dependency to pkg', () => {
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
