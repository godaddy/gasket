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

const configure = (await import('../lib/configure.js')).default;

describe('configureHook', () => {
  let mockGasket;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGasket = {
      execSync: jest.fn().mockReturnValue([{ id: 'test', description: 'test', action: jest.fn() }])
    };
  });

  it('should be a function', () => {
    expect(configure).toEqual(expect.any(Function));
  });

  it('should not execSync commands if not a gasket command', () => {
    configure(mockGasket);
    expect(mockGasket.execSync).not.toHaveBeenCalled();
  });

  it('should execute on gasket command', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    configure(mockGasket);
    expect(mockGasket.execSync).toHaveBeenCalled();
  });

  it('should add commands to gasketBin', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    configure(mockGasket);
    expect(mockAddCommand).toHaveBeenCalled();
  });

  it('should parse commands', () => {
    process.argv = ['node', '/path/to/gasket.js'];
    configure(mockGasket);
    expect(mockParse).toHaveBeenCalled();
  });
});
