/* eslint-disable no-sync */
import { jest } from '@jest/globals';

const mockAddCommand = jest.fn();
const mockParse = jest.fn();
const mockProcessCommand = jest.fn();

jest.unstable_mockModule('../lib/cli.js', () => {

  return {
    gasketBin: {
      addCommand: mockAddCommand,
      parse: mockParse
    },
    processCommand: mockProcessCommand.mockReturnValue({ command: 'test', hidden: false, isDefault: false })
  };
});

const configure = ((await import('../lib/configure.js')).default).handler;

describe('configure', () => {
  let mockGasket, mockConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGasket = {
      execSync: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }]),
      config: {
        env: 'development'
      }
    };
    mockConfig = {};
  });

  it('should be a function', () => {
    expect(configure).toEqual(expect.any(Function));
  });

  it('should not exec commands if not a gasket command', () => {
    configure(mockGasket, mockConfig);
    expect(mockGasket.execSync).not.toHaveBeenCalled();
  });

  it('should execute on gasket command', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    configure(mockGasket, mockConfig);
    expect(mockGasket.execSync).toHaveBeenCalled();
  });

  it('should add commands to gasketBin', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    configure(mockGasket, mockConfig);
    expect(mockAddCommand).toHaveBeenCalled();
  });
});
