import { jest } from '@jest/globals';
import create from '../lib/create.js';
import pkg from '../package.json' with { type: 'json' };
const { name, version } = pkg;

describe('create', () => {
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

  it('should be a function', () => {
    expect(create).toEqual(expect.any(Function));
  });

  it('should add pluginCommand to gasketConfig', () => {
    create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginCommand', name);
  });

  it('should add dependency to pkg', () => {
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
